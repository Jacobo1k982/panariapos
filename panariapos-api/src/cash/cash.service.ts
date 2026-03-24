import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { PrismaService } from '../prisma/prisma.service'

export class OpenRegisterDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  openingAmount: number
}

export class CloseRegisterDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  closingAmount: number

  @IsOptional()
  @IsString()
  notes?: string
}

@Injectable()
export class CashService {
  constructor(private prisma: PrismaService) {}

  async open(branchId: string, userId: string, dto: OpenRegisterDto) {
    const open = await this.prisma.cashRegister.findFirst({
      where: { branchId, closedAt: null },
    })
    if (open) throw new BadRequestException('Ya hay una caja abierta en esta sucursal')

    return this.prisma.cashRegister.create({
      data: { branchId, userId, openingAmount: dto.openingAmount },
      include: { user: { select: { name: true } } },
    })
  }

  async close(branchId: string, id: string, dto: CloseRegisterDto) {
    const register = await this.prisma.cashRegister.findFirst({
      where: { id, branchId, closedAt: null },
    })
    if (!register) throw new NotFoundException('Caja no encontrada o ya cerrada')

    const cashSales = await this.prisma.sale.aggregate({
      where: { cashRegisterId: id, paymentMethod: 'CASH', status: 'COMPLETED' },
      _sum:  { total: true },
    })

    const expectedAmount = Number(register.openingAmount) + Number(cashSales._sum.total ?? 0)
    const difference     = dto.closingAmount - expectedAmount

    return this.prisma.cashRegister.update({
      where: { id },
      data: {
        closedAt:       new Date(),
        closingAmount:  dto.closingAmount,
        expectedAmount,
        difference,
        notes:          dto.notes,
      },
      include: { user: { select: { name: true } } },
    })
  }

  async getCurrent(branchId: string) {
    return this.prisma.cashRegister.findFirst({
      where:   { branchId, closedAt: null },
      include: { user: { select: { name: true } } },
    })
  }

  async getSummary(id: string, branchId: string) {
    const register = await this.prisma.cashRegister.findFirst({
      where: { id, branchId },
    })
    if (!register) throw new NotFoundException('Caja no encontrada')

    const [sales, byMethod] = await Promise.all([
      this.prisma.sale.aggregate({
        where:  { cashRegisterId: id, status: 'COMPLETED' },
        _sum:   { total: true, discount: true },
        _count: { id: true },
      }),
      this.prisma.sale.groupBy({
        by:    ['paymentMethod'],
        where: { cashRegisterId: id, status: 'COMPLETED' },
        _sum:  { total: true },
        _count:{ id: true },
      }),
    ])

    return {
      register,
      totalSales:    Number(sales._sum.total    ?? 0),
      totalOrders:   sales._count.id,
      totalDiscount: Number(sales._sum.discount ?? 0),
      byMethod,
    }
  }

  async getHistory(branchId: string, limit = 10) {
    return this.prisma.cashRegister.findMany({
      where:   { branchId },
      orderBy: { openedAt: 'desc' },
      take:    limit,
      include: { user: { select: { name: true } } },
    })
  }
}
