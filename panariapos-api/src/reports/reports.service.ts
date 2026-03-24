import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async salesSummary(branchId: string, from: string, to: string) {
        const where = {
            branchId,
            status: 'COMPLETED' as const,
            createdAt: { gte: new Date(from), lte: new Date(to) },
        }

        const [totals, byMethod, byDay] = await Promise.all([
            this.prisma.sale.aggregate({
                where,
                _sum: { total: true, discount: true },
                _count: { id: true },
            }),
            this.prisma.sale.groupBy({
                by: ['paymentMethod'],
                where,
                _sum: { total: true },
                _count: { id: true },
            }),
            this.prisma.$queryRaw<{ date: string; total: number; count: number }[]>`
        SELECT
          DATE(created_at)::text AS date,
          SUM(total)::float      AS total,
          COUNT(id)::int         AS count
        FROM sales
        WHERE branch_id      = ${branchId}
          AND status         = 'COMPLETED'
          AND created_at    >= ${new Date(from)}
          AND created_at    <= ${new Date(to)}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `,
        ])

        return {
            totalRevenue: totals._sum.total ?? 0,
            totalOrders: totals._count.id,
            totalDiscount: totals._sum.discount ?? 0,
            avgTicket: totals._count.id > 0
                ? Number(totals._sum.total ?? 0) / totals._count.id : 0,
            byMethod,
            byDay,
        }
    }

    async topProducts(branchId: string, from: string, to: string, limit = 10) {
        return this.prisma.$queryRaw<{
            productId: string; productName: string
            totalQty: number; totalRevenue: number
        }[]>`
      SELECT
        sl.product_id                    AS "productId",
        sl.product_name                  AS "productName",
        SUM(sl.quantity)::float          AS "totalQty",
        SUM(sl.subtotal)::float          AS "totalRevenue"
      FROM sale_lines sl
      JOIN sales s ON s.id = sl.sale_id
      WHERE s.branch_id  = ${branchId}
        AND s.status     = 'COMPLETED'
        AND s.created_at >= ${new Date(from)}
        AND s.created_at <= ${new Date(to)}
      GROUP BY sl.product_id, sl.product_name
      ORDER BY "totalRevenue" DESC
      LIMIT ${limit}
    `
    }

    async inventoryValuation(branchId: string) {
        const items = await this.prisma.inventoryItem.findMany({ where: { branchId } })
        const totalValue = items.reduce((a, i) => a + Number(i.quantity) * Number(i.costPerUnit), 0)
        return { items, totalValue }
    }

    async cashFlow(branchId: string, from: string, to: string) {
        const [income, byDay] = await Promise.all([
            this.prisma.sale.aggregate({
                where: { branchId, status: 'COMPLETED', createdAt: { gte: new Date(from), lte: new Date(to) } },
                _sum: { total: true },
            }),
            this.prisma.$queryRaw<{ date: string; income: number }[]>`
        SELECT
          DATE(created_at)::text AS date,
          SUM(total)::float      AS income
        FROM sales
        WHERE branch_id  = ${branchId}
          AND status     = 'COMPLETED'
          AND created_at >= ${new Date(from)}
          AND created_at <= ${new Date(to)}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `,
        ])

        return { totalIncome: income._sum.total ?? 0, byDay }
    }
}