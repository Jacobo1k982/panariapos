import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Plan } from '@prisma/client'

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getAllTenants(query: { active?: boolean; plan?: Plan }) {
        return this.prisma.tenant.findMany({
            where: { active: query.active, plan: query.plan },
            include: {
                _count: { select: { users: true, branches: true } },
                branches: { select: { id: true, name: true, active: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    async getTenant(id: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                branches: true,
                users: { select: { id: true, name: true, email: true, role: true, active: true } },
                _count: { select: { users: true, products: true, customers: true } },
            },
        })
        if (!tenant) throw new NotFoundException('Tenant no encontrado')
        return tenant
    }

    async updatePlan(id: string, plan: Plan) {
        return this.prisma.tenant.update({ where: { id }, data: { plan } })
    }

    async toggleTenant(id: string, active: boolean) {
        return this.prisma.tenant.update({ where: { id }, data: { active } })
    }

    async getMetrics() {
        const [
            totalTenants, activeTenants,
            byPlan, totalSalesThisMonth,
        ] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.tenant.count({ where: { active: true } }),
            this.prisma.tenant.groupBy({ by: ['plan'], _count: { id: true } }),
            this.prisma.sale.aggregate({
                where: {
                    status: 'COMPLETED',
                    createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
                },
                _sum: { total: true },
                _count: { id: true },
            }),
        ])

        return {
            totalTenants,
            activeTenants,
            byPlan,
            totalSalesThisMonth: totalSalesThisMonth._sum.total ?? 0,
            totalOrdersThisMonth: totalSalesThisMonth._count.id,
        }
    }
}