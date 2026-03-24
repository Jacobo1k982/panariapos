import {
    Controller, Get, Post, Body, Param, Query,
    UseGuards
} from '@nestjs/common'
import { SalesService } from './sales.service'
import { CreateSaleDto } from './dto/create-sale.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
    constructor(private sales: SalesService) { }

    @Post()
    create(@CurrentUser() user: any, @Body() dto: CreateSaleDto) {
        return this.sales.create(user.tenantId, user.branchId, user.id, dto)
    }

    @Get()
    findAll(@CurrentUser() user: any, @Query() query: { from?: string; to?: string; limit?: number }) {
        return this.sales.findAll(user.branchId, query)
    }

    @Get('summary/daily')
    daily(@CurrentUser() user: any, @Query('date') date?: string) {
        return this.sales.getDailySummary(user.branchId, date)
    }

    @Get(':id')
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.sales.findOne(id, user.branchId)
    }
}