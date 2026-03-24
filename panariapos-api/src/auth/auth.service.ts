import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findFirst({
            where: { email, active: true },
            include: { tenant: true, branch: true },
        })
        if (!user) throw new UnauthorizedException('Credenciales inválidas')
        if (!user.tenant.active) throw new ForbiddenException('Cuenta suspendida')

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) throw new UnauthorizedException('Credenciales inválidas')

        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        })

        return user
    }

    async login(user: any) {
        const payload = {
            sub: user.id,
            tenantId: user.tenantId,
            branchId: user.branchId,
            role: user.role,
        }

        const accessToken = this.jwt.sign(payload)
        const refreshToken = this.jwt.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        })

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        await this.prisma.refreshToken.create({
            data: { userId: user.id, token: refreshToken, expiresAt },
        })

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                tenantName: user.tenant.name,
                branchId: user.branchId,
                branchName: user.branch?.name,
                plan: user.tenant.plan,
                trialEndsAt: user.tenant.trialEndsAt,
            },
        }
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            })

            const stored = await this.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
            })
            if (!stored || stored.expiresAt < new Date()) {
                throw new UnauthorizedException('Refresh token inválido o expirado')
            }

            const newAccess = this.jwt.sign({
                sub: payload.sub,
                tenantId: payload.tenantId,
                branchId: payload.branchId,
                role: payload.role,
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