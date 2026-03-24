import {
    Controller, Get, Post, Patch, Body,
    Param, Query, UseGuards
} from '@nestjs/common'
import { ProductionService, CreateRecipeDto, CreateProductionOrderDto } from './production.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('production')
export class ProductionController {
    constructor(private production: ProductionService) { }

    // Recetas
    @Post('recipes')
    createRecipe(@CurrentUser() u: any, @Body() dto: CreateRecipeDto) {
        return this.production.createRecipe(u.tenantId, dto)
    }

    @Get('recipes')
    findRecipes(@CurrentUser() u: any) {
        return this.production.findRecipes(u.tenantId)
    }

    @Get('recipes/:id')
    findRecipe(@CurrentUser() u: any, @Param('id') id: string) {
        return this.production.findRecipe(u.tenantId, id)
    }

    // Órdenes
    @Post('orders')
    createOrder(@CurrentUser() u: any, @Body() dto: CreateProductionOrderDto) {
        return this.production.createOrder(u.branchId, u.tenantId, dto)
    }

    @Get('orders')
    findOrders(@CurrentUser() u: any, @Query('status') status?: string) {
        return this.production.findOrders(u.branchId, status)
    }

    @Patch('orders/:id/start')
    startOrder(@CurrentUser() u: any, @Param('id') id: string) {
        return this.production.startOrder(u.branchId, id)
    }

    @Patch('orders/:id/complete')
    completeOrder(@CurrentUser() u: any, @Param('id') id: string) {
        return this.production.completeOrder(u.branchId, id)
    }

    @Patch('orders/:id/cancel')
    cancelOrder(@CurrentUser() u: any, @Param('id') id: string) {
        return this.production.cancelOrder(u.branchId, id)
    }
}