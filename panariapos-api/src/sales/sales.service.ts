import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSaleDto } from './dto/create-sale.dto'

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, branchId: string, userId: string, dto: CreateSaleDto) {
    const products = await this.prisma.product.findMany({
      where: {
        id:       { in: dto.lines.map(l => l.productId) },
        tenantId,
        active:   true,
      },
    })

    if (products.length !== dto.lines.length) {
      throw new BadRequestException('Uno o mas productos no encontrados o inactivos')
    }

    const lines = dto.lines.map(line => {
      const product  = products.find(p => p.id === line.productId)!
      const subtotal = line.quantity * line.unitPrice * (1 - line.discount / 100)
      return {
        productId:   line.productId,
        productName: product.name,
        quantity:    line.quantity,
        unitPrice:   line.unitPrice,
        discount:    line.discount,
        subtotal:    Math.round(subtotal),
      }
    })

    const subtotal = lines.reduce((a, l) => a + Number(l.subtotal), 0)
    const total    = Math.round(subtotal * (1 - dto.discount / 100))

    const lastSale = await this.prisma.sale.findFirst({
      where:   { branchId },
      orderBy: { createdAt: 'desc' },
      select:  { receiptNumber: true },
    })
    const nextNum       = lastSale ? parseInt(lastSale.receiptNumber) + 1 : 1
    const receiptNumber = String(nextNum).padStart(6, '0')

    const sale = await this.prisma.$transaction(async tx => {
      const created = await tx.sale.create({
        data: {
          branchId,
          userId,
          customerId:     dto.customerId,
          cashRegisterId: dto.cashRegisterId,
          receiptNumber,
          subtotal,
          discount:      dto.discount,
          total,
          paymentMethod: dto.paymentMethod,
          paymentRef:    dto.paymentRef,
          notes:         dto.notes,
          lines:         { create: lines },
        },
        include: {
          lines:        true,
          customer:     true,
          user:         { select: { name: true } },
          cashRegister: { select: { openedAt: true } },
        },
      })

      if (dto.paymentMethod === 'CREDIT' && dto.customerId) {
        const customer = await tx.customer.findUnique({ where: { id: dto.customerId } })
        if (!customer) throw new NotFoundException('Cliente no encontrado')
        if (Number(customer.creditBalance) + total > Number(customer.creditLimit)) {
          throw new BadRequestException(
            `El cliente excede su limite de credito. Disponible: ${Number(customer.creditLimit) - Number(customer.creditBalance)}`
          )
        }
        await tx.customer.update({
          where: { id: dto.customerId },
          data:  { creditBalance: { increment: total } },
        })
        await tx.creditTransaction.create({
          data: {
            customerId: dto.customerId,
            type:       'CHARGE',
            amount:     total,
            note:       `Venta #${receiptNumber}`,
          },
        })
      }

      if (dto.customerId) {
        const points = Math.floor(total / 100)
        if (points > 0) {
          await tx.customer.update({
            where: { id: dto.customerId },
            data:  { loyaltyPoints: { increment: points } },
          })
        }
      }

      return created
    })

    return sale
  }

  async findAll(branchId: string, query: { from?: string; to?: string; limit?: number }) {
    const where: any = { branchId }

    if (query.from || query.to) {
      where.createdAt = {}
      if (query.from) {
        where.createdAt.gte = new Date(query.from)
      }
      if (query.to) {
        const toDate = new Date(query.to)
        toDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = toDate
      }
    }

    return this.prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take:    Number(query.limit) || 100,
      include: {
        lines:    true,
        customer: { select: { name: true } },
        user:     { select: { name: true } },
      },
    })
  }

  async findOne(id: string, branchId: string) {
    const sale = await this.prisma.sale.findFirst({
      where:   { id, branchId },
      include: {
        lines: {
          include: { product: { select: { name: true, sku: true } } },
        },
        customer:     true,
        user:         { select: { name: true } },
        cashRegister: { select: { openedAt: true } },
      },
    })
    if (!sale) throw new NotFoundException('Venta no encontrada')
    return sale
  }

  async getDailySummary(branchId: string, date?: string) {
    const day   = date ? new Date(date) : new Date()
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    const [sales, byMethod] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          branchId,
          status:    'COMPLETED',
          createdAt: { gte: start, lte: end },
        },
        _sum:   { total: true, discount: true },
        _count: { id: true },
      }),
      this.prisma.sale.groupBy({
        by:    ['paymentMethod'],
        where: {
          branchId,
          status:    'COMPLETED',
          createdAt: { gte: start, lte: end },
        },
        _sum:   { total: true },
        _count: { id: true },
      }),
    ])

    return {
      totalRevenue:  Number(sales._sum.total    ?? 0),
      totalOrders:   sales._count.id,
      totalDiscount: Number(sales._sum.discount ?? 0),
      avgTicket:     sales._count.id > 0
        ? Math.round(Number(sales._sum.total ?? 0) / sales._count.id) : 0,
      byMethod,
      date: start.toISOString().split('T')[0],
    }
  }
}
