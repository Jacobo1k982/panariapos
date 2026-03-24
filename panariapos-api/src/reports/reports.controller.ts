import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
    constructor(private reports: ReportsService) { }

    @Get('sales')
    salesSummary(
        @CurrentUser() u: any,
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        const now = new Date()
        const start = from ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const end = to ?? now.toISOString()
        return this.reports.salesSummary(u.branchId, start, end)
    }

    @Get('top-products')
    topProducts(
        @CurrentUser() u: any,
        @Query('from') from: string,
        @Query('to') to: string,
        @Query('limit') limit: number,
    ) {
        const now = new Date()
        return this.reports.topProducts(
            u.branchId,
            from ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
            to ?? now.toISOString(),
            limit ?? 10,
        )
    }

    @Get('inventory-valuation')
    inventoryValuation(@CurrentUser() u: any) {
        return this.reports.inventoryValuation(u.branchId)
    }

    @Get('cash-flow')
    cashFlow(
        @CurrentUser() u: any,
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        const now = new Date()
        return this.reports.cashFlow(
            u.branchId,
            from ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
            to ?? now.toISOString(),
        )
    }
}