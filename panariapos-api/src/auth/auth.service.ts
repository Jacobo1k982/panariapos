import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { JwtService }    from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt       from 'bcryptjs'

@Injectable()
export class AuthService {
    constructor(
        private prisma:  PrismaService,
        private jwt:     JwtService,
        private config:  ConfigService,
    ) {}

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findFirst({
            where:   { email, active: true },
            include: { tenant: true, branch: true },
        })
        if (!user) throw new UnauthorizedException('Credenciales inválidas')
        if (!user.tenant.active) throw new ForbiddenException('Cuenta suspendida')

        // ── Verificación de trial ────────────────────────────────────────────
        const tenant  = user.tenant
        const isPaid  = tenant.plan !== 'BASIC' || !tenant.trialEndsAt
        if (!isPaid && tenant.trialEndsAt) {
            const now      = new Date()
            const trialEnd = new Date(tenant.trialEndsAt)
            if (trialEnd < now) {
                const daysExpired = Math.ceil((now.getTime() - trialEnd.getTime()) / (1000 * 60 * 60 * 24))
                throw new ForbiddenException(
                    `Tu período de prueba gratuita venció hace ${daysExpired} día${daysExpired !== 1 ? 's' : ''}. ` +
                    `Activá un plan para continuar usando PanariaPOS.`
                )
            }
        }

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) throw new UnauthorizedException('Credenciales inválidas')

        await this.prisma.user.update({
            where: { id: user.id },
            data:  { lastLogin: new Date() },
        })

        // ── Registrar login en ActivityLog ───────────────────────────────────
        await this.prisma.activityLog.create({
            data: {
                userId:   user.id,
                action:   'LOGIN',
                entity:   'User',
                entityId: user.id,
                metadata: {
                    tenantId:   user.tenantId,
                    tenantName: user.tenant.name,
                    plan:       user.tenant.plan,
                },
            },
        }).catch(() => {}) // no bloquear si falla el log

        return user
    }

    async login(user: any) {
        const payload = {
            sub:      user.id,
            tenantId: user.tenantId,
            branchId: user.branchId,
            role:     user.role,
        }

        const accessToken  = this.jwt.sign(payload)
        const refreshToken = this.jwt.sign(payload, {
            secret:    this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        })

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        await this.prisma.refreshToken.create({
            data: { userId: user.id, token: refreshToken, expiresAt },
        })

        const tenant      = user.tenant
        const trialEndsAt = tenant.trialEndsAt ? new Date(tenant.trialEndsAt) : null
        const daysLeft    = trialEndsAt
            ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : null

        return {
            accessToken,
            refreshToken,
            user: {
                id:            user.id,
                name:          user.name,
                email:         user.email,
                role:          user.role,
                tenantId:      user.tenantId,
                tenantName:    tenant.name,
                branchId:      user.branchId,
                branchName:    user.branch?.name,
                plan:          tenant.plan,
                currency:      tenant.currency ?? 'CRC',
                trialEndsAt:   tenant.trialEndsAt,
                trialDaysLeft: daysLeft,
            },
        }
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            })
            const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } })
            if (!stored || stored.expiresAt < new Date()) {
                throw new UnauthorizedException('Refresh token inválido o expirado')
            }
            const newAccess = this.jwt.sign({
                sub:      payload.sub,
                tenantId: payload.tenantId,
                branchId: payload.branchId,
                role:     payload.role,
            })
            return { accessToken: newAccess }
        } catch {
            throw new UnauthorizedException('Refresh token inválido')
        }
    }

    async logout(refreshToken: string) {
        await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
        return { message: 'Sesión cerrada' }
    }
}
