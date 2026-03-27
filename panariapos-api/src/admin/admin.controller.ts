import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard }  from '../auth/guards/jwt.guard'
import { RolesGuard }    from '../auth/guards/roles.guard'
import { Roles }         from '../auth/decorators/roles.decorator'
import { Role }          from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private prisma: PrismaService) {}

    // ── Métricas globales ────────────────────────────────────────────────────
    @Get('metrics')
    async getMetrics() {
        const [
            totalTenants,
            activeTenants,
            byPlan,
            totalSalesThisMonth,
            totalOrdersThisMonth,
            loginsToday,
            loginsThisWeek,
            registrationsToday,
            registrationsThisWeek,
            registrationsThisMonth,
        ] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.tenant.count({ where: { active: true } }),
            this.prisma.tenant.groupBy({ by: ['plan'], _count: { id: true } }),
            this.prisma.sale.aggregate({
                _sum: { total: true },
                where: { createdAt: { gte: new Date(new Date().setDate(1)) } },
            }),
            this.prisma.sale.count({
                where: { createdAt: { gte: new Date(new Date().setDate(1)) } },
            }),
            // Logins hoy
            this.prisma.activityLog.count({
                where: {
                    action:    'LOGIN',
                    createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                },
            }),
            // Logins esta semana
            this.prisma.activityLog.count({
                where: {
                    action:    'LOGIN',
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            }),
            // Registros hoy
            this.prisma.tenant.count({
                where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
            }),
            // Registros esta semana
            this.prisma.tenant.count({
                where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
            }),
            // Registros este mes
            this.prisma.tenant.count({
                where: { createdAt: { gte: new Date(new Date().setDate(1)) } },
            }),
        ])

        return {
            totalTenants,
            activeTenants,
            byPlan,
            totalSalesThisMonth:  Number(totalSalesThisMonth._sum.total ?? 0),
            totalOrdersThisMonth,
            loginsToday,
            loginsThisWeek,
            registrationsToday,
            registrationsThisWeek,
            registrationsThisMonth,
        }
    }

    // ── Actividad reciente ───────────────────────────────────────────────────
    @Get('activity')
    async getActivity() {
        const [recentLogins, recentRegistrations, loginsByDay, registrationsByDay] = await Promise.all([
            // Últimos 20 logins
            this.prisma.activityLog.findMany({
                where:   { action: 'LOGIN' },
                orderBy: { createdAt: 'desc' },
                take:    20,
                include: {
                    user: {
                        select: {
                            name:   true,
                            email:  true,
                            role:   true,
                            tenant: { select: { name: true, plan: true } },
                        },
                    },
                },
            }),
            // Últimos 10 registros de negocios
            this.prisma.tenant.findMany({
                orderBy: { createdAt: 'desc' },
                take:    10,
                select: {
                    id:         true,
                    name:       true,
                    plan:       true,
                    active:     true,
                    createdAt:  true,
                    _count:     { select: { users: true } },
                },
            }),
            // Logins por día (últimos 7 días)
            this.prisma.$queryRaw`
                SELECT
                    DATE(created_at) as date,
                    COUNT(*)::int    as count
                FROM activity_logs
                WHERE action = 'LOGIN'
                  AND created_at >= NOW() - INTERVAL '7 days'
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `,
            // Registros por día (últimos 30 días)
            this.prisma.$queryRaw`
                SELECT
                    DATE(created_at) as date,
                    COUNT(*)::int    as count
                FROM tenants
                WHERE created_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `,
        ])

        return { recentLogins, recentRegistrations, loginsByDay, registrationsByDay }
    }

    // ── Users ────────────────────────────────────────────────────────────────
    @Get('users')
    async getAllUsers(
        @Query('role')   role?:   string,
        @Query('active') active?: string,
    ) {
        return this.prisma.user.findMany({
            where: {
                role:   role   ? role as any   : undefined,
                active: active !== undefined ? active === 'true' : undefined,
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id:        true,
                name:      true,
                email:     true,
                role:      true,
                active:    true,
                lastLogin: true,
                createdAt: true,
                tenant:    { select: { id: true, name: true, plan: true } },
                branch:    { select: { id: true, name: true } },
            },
        })
    }

    // ── Tenants ──────────────────────────────────────────────────────────────
    @Get('tenants')
    async getTenants() {
        return this.prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { users: true, branches: true, products: true } },
            },
        })
    }

    @Get('tenants/:id')
    async getTenant(@Param('id') id: string) {
        return this.prisma.tenant.findUnique({
            where:   { id },
            include: {
                users:    { select: { id: true, name: true, email: true, role: true, lastLogin: true } },
                branches: true,
                _count:   { select: { users: true, branches: true, products: true } },
            },
        })
    }

    @Patch('tenants/:id/plan')
    async updatePlan(@Param('id') id: string, @Body('plan') plan: string) {
        return this.prisma.tenant.update({ where: { id }, data: { plan: plan as any } })
    }

    @Patch('tenants/:id/toggle')
    async toggleTenant(@Param('id') id: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id } })
        return this.prisma.tenant.update({ where: { id }, data: { active: !tenant?.active } })
    }
}
