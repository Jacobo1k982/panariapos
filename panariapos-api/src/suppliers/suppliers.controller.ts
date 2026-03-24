import { Controller, Get, Post, Patch, Delete,
         Body, Param, Query, UseGuards } from '@nestjs/common'
import { SuppliersService } from './suppliers.service'
import {
  CreateSupplierDto, UpdateSupplierDto,
  CreatePurchaseOrderDto, UpdatePurchaseOrderDto
} from './dto/supplier.dto'
import { JwtAuthGuard }  from '../auth/guards/jwt.guard'
import { RolesGuard }    from '../auth/guards/roles.guard'
import { Roles }         from '../auth/decorators/roles.decorator'
import { CurrentUser }   from '../auth/decorators/current-user.decorator'
import { Role }          from '@prisma/client'

@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliers: SuppliersService) {}

  // ── Proveedores ─────────────────────────────────────────────────────────────
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  create(@CurrentUser() u: any, @Body() dto: CreateSupplierDto) {
    return this.suppliers.create(u.tenantId, dto)
  }

  @Get()
  findAll(@CurrentUser() u: any, @Query('search') search?: string) {
    return this.suppliers.findAll(u.tenantId, search)
  }

  @Get('payables')
  getPayables(@CurrentUser() u: any) {
    return this.suppliers.getPayablesSummary(u.tenantId)
  }

  @Get(':id')
  findOne(@CurrentUser() u: any, @Param('id') id: string) {
    return this.suppliers.findOne(u.tenantId, id)
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliers.update(u.tenantId, id, dto)
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@CurrentUser() u: any, @Param('id') id: string) {
    return this.suppliers.remove(u.tenantId, id)
  }

  // ── Órdenes de compra ────────────────────────────────────────────────────────
  @Post('orders')
  createOrder(@CurrentUser() u: any, @Body() dto: CreatePurchaseOrderDto) {
    return this.suppliers.createOrder(u.tenantId, dto)
  }

  @Get('orders/all')
  findOrders(
    @CurrentUser() u: any,
    @Query('supplierId') supplierId?: string,
    @Query('status')     status?: string,
  ) {
    return this.suppliers.findOrders(u.tenantId, supplierId, status)
  }

  @Get('orders/:id')
  findOneOrder(@CurrentUser() u: any, @Param('id') id: string) {
    return this.suppliers.findOneOrder(u.tenantId, id)
  }

  @Patch('orders/:id')
  updateOrder(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.suppliers.updateOrder(u.tenantId, id, dto)
  }

  @Patch('orders/:id/receive')
  receiveOrder(@CurrentUser() u: any, @Param('id') id: string) {
    return this.suppliers.receiveOrder(u.tenantId, id)
  }
}
