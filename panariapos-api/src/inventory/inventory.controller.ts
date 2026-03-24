import {
    Controller, Get, Post, Patch, Body,
    Param, Query, UseGuards
} from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { CreateInventoryItemDto, AdjustInventoryDto } from './dto/inventory.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
    constructor(private inventory: InventoryService) { }

    @Post()
    create(@CurrentUser() u: any, @Body() dto: CreateInventoryItemDto) {
        return this.inventory.create(u.branchId, dto)
    }

    @Get()
    findAll(
        @CurrentUser() u: any,
        @Query('category') category?: string,
        @Query('alerts') alerts?: string,
    ) {
        return this.inventory.findAll(u.branchId, { category, alerts: alerts === 'true' })
    }

    @Get('alerts')
    getAlerts(@CurrentUser() u: any) {
        return this.inventory.getAlerts(u.branchId)
    }

    @Get(':id')
    findOne(@CurrentUser() u: any, @Param('id') id: string) {
        return this.inventory.findOne(u.branchId, id)
    }

    @Patch(':id')
    update(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: Partial<CreateInventoryItemDto>) {
        return this.inventory.update(u.branchId, id, dto)
    }

    @Post(':id/adjust')
    adjust(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: AdjustInventoryDto) {
        return this.inventory.adjust(u.branchId, id, dto)
    }
}