import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateSupplierDto, UpdateSupplierDto,
  CreatePurchaseOrderDto, UpdatePurchaseOrderDto
} from './dto/supplier.dto'

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  // ── Proveedores ─────────────────────────────────────────────────────────────
  async create(tenantId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: { tenantId, ...dto },
    })
  }

  async findAll(tenantId: string, search?: string) {
    return this.prisma.supplier.findMany({
      where: {
        tenantId,
        name: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      include: { _count: { select: { purchaseOrders: true } } },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(tenantId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
      include: {
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { lines: true },
        },
      },
    })
    if (!supplier) throw new NotFoundException('Proveedor no encontrado')
    return supplier
  }

  async update(tenantId: string, id: string, dto: UpdateSupplierDto) {
    await this.findOne(tenantId, id)
    return this.prisma.supplier.update({ where: { id }, data: dto })
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id)
    return this.prisma.supplier.delete({ where: { id } })
  }

  // ── Órdenes de compra ────────────────────────────────────────────────────────
  async createOrder(tenantId: string, dto: CreatePurchaseOrderDto) {
    // Verificar que el proveedor pertenece al tenant
    await this.findOne(tenantId, dto.supplierId)

    const total = dto.lines.reduce((a, l) => a + l.quantity * l.cost, 0)

    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: dto.supplierId,
        total,
        notes: dto.notes,
        lines: {
          create: dto.lines.map(l => ({
            itemName: l.itemName,
            quantity: l.quantity,
            unit:     l.unit,
            cost:     l.cost,
          })),
        },
      },
      include: {
        supplier: { select: { name: true } },
        lines: true,
      },
    })
  }

  async findOrders(tenantId: string, supplierId?: string, status?: string) {
    return this.prisma.purchaseOrder.findMany({
      where: {
        supplier: { tenantId },
        supplierId,
        status: status as any,
      },
      include: {
        supplier: { select: { id: true, name: true } },
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOneOrder(tenantId: string, id: string) {
    const order = await this.prisma.purchaseOrder.findFirst({
      where: {
        id,
        supplier: { tenantId },
      },
      include: {
        supplier: true,
        lines: true,
      },
    })
    if (!order) throw new NotFoundException('Orden de compra no encontrada')
    return order
  }

  async updateOrder(tenantId: string, id: string, dto: UpdatePurchaseOrderDto) {
    await this.findOneOrder(tenantId, id)
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: dto,
      include: {
        supplier: { select: { name: true } },
        lines: true,
      },
    })
  }

  async receiveOrder(tenantId: string, id: string) {
    const order = await this.findOneOrder(tenantId, id)

    if (order.status !== 'PENDING') {
      throw new NotFoundException('La orden ya fue procesada')
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'RECEIVED' },
      include: {
        supplier: { select: { name: true } },
        lines: true,
      },
    })
  }

  // Resumen de cuentas por pagar
  async getPayablesSummary(tenantId: string) {
    const orders = await this.prisma.purchaseOrder.findMany({
      where: {
        supplier: { tenantId },
        status: 'PENDING',
      },
      include: { supplier: { select: { id: true, name: true } } },
    })

    const total = orders.reduce((a, o) => a + Number(o.total), 0)

    return {
      totalPayable: total,
      orderCount:   orders.length,
      orders,
    }
  }
}
