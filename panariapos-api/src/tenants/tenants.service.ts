import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { IsOptional, IsString, IsEmail, MinLength, MaxLength } from 'class-validator'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'

// Mapa timezone → moneda (mismo que en el frontend)
const TIMEZONE_TO_CURRENCY: Record<string, string> = {
    'America/Costa_Rica':   'CRC',
    'America/Managua':      'NIO',
    'America/Guatemala':    'GTQ',
    'America/Tegucigalpa':  'HNL',
    'America/El_Salvador':  'SVC',
    'America/Belize':       'BZD',
    'America/Panama':       'PAB',
    'America/New_York':     'USD',
    'America/Chicago':      'USD',
    'America/Los_Angeles':  'USD',
}

export class RegisterTenantDto {
    @IsString()
    businessName: string

    @IsString()
    ownerName: string

    @IsEmail()
    email: string

    @IsString()
    @MinLength(8)
    password: string

    @IsOptional()
    @IsString()
    phone?: string

    @IsOptional()
    @IsString()
    address?: string

    @IsOptional()
    @IsString()
    timezone?: string

    @IsOptional()
    @IsString()
    currency?: string
}

export class UpdateTenantDto {
    @IsOptional() @IsString() @MaxLength(100) name?:       string
    @IsOptional() @IsString() @MaxLength(20)  phone?:      string
    @IsOptional() @IsString() @MaxLength(200) address?:    string
    @IsOptional() @IsString()                 logoUrl?:    string
    @IsOptional() @IsString() @MaxLength(200) receiptMsg?: string
    @IsOptional() @IsString() @MaxLength(100) slogan?:     string
    @IsOptional() @IsString()                 timezone?:   string
    @IsOptional() @IsString() @MaxLength(3)   currency?:   string
}

@Injectable()
export class TenantsService {
    constructor(private prisma: PrismaService) {}

    async register(dto: RegisterTenantDto) {
        const slug = dto.businessName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

        const exists = await this.prisma.tenant.findUnique({ where: { slug } })
        if (exists) throw new ConflictException('Nombre de negocio ya registrado')

        const passwordHash = await bcrypt.hash(dto.password, 12)
        const trialEndsAt  = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)

        // Determinar moneda: usar la enviada, o derivarla del timezone, o CRC por defecto
        const currency = dto.currency
            ?? TIMEZONE_TO_CURRENCY[dto.timezone ?? 'America/Costa_Rica']
            ?? 'CRC'

        return this.prisma.$transaction(async tx => {
            const tenant = await tx.tenant.create({
                data: {
                    name:        dto.businessName,
                    slug,
                    phone:       dto.phone,
                    address:     dto.address,
                    timezone:    dto.timezone ?? 'America/Costa_Rica',
                    currency,
                    trialEndsAt,
                },
            })

            const branch = await tx.branch.create({
                data: {
                    tenantId: tenant.id,
                    name:     'Sucursal Principal',
                    address:  dto.address,
                    phone:    dto.phone,
                },
            })

            await tx.user.create({
                data: {
                    tenantId:     tenant.id,
                    branchId:     branch.id,
                    name:         dto.ownerName,
                    email:        dto.email,
                    passwordHash,
                    role:         'ADMIN',
                },
            })

            await tx.category.createMany({
                data: [
                    { tenantId: tenant.id, name: 'Pan',       emoji: '🍞' },
                    { tenantId: tenant.id, name: 'Reposteria', emoji: '🧁' },
                    { tenantId: tenant.id, name: 'Bebidas',    emoji: '☕' },
                    { tenantId: tenant.id, name: 'Otros',      emoji: '📦' },
                ],
            })

            return {
                tenant:      { id: tenant.id, name: tenant.name, slug, currency },
                branch:      { id: branch.id, name: branch.name },
                trialEndsAt,
                message:     'Negocio registrado exitosamente. Tenés 15 días de prueba gratuita.',
            }
        })
    }

    async findOne(id: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where:   { id },
            include: {
                branches: { where: { active: true } },
                _count:   { select: { users: true, products: true } },
            },
        })
        if (!tenant) throw new NotFoundException('Tenant no encontrado')
        return tenant
    }

    async update(id: string, dto: UpdateTenantDto) {
        return this.prisma.tenant.update({ where: { id }, data: dto })
    }

    async getTrialStatus(id: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where:  { id },
            select: { trialEndsAt: true, plan: true },
        })
        if (!tenant) throw new NotFoundException('Tenant no encontrado')
        if (!tenant.trialEndsAt) return { onTrial: false, daysLeft: 0 }

        const daysLeft = Math.ceil(
            (tenant.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )

        return {
            onTrial:     daysLeft > 0,
            daysLeft:    Math.max(0, daysLeft),
            trialEndsAt: tenant.trialEndsAt,
            plan:        tenant.plan,
        }
    }
}
