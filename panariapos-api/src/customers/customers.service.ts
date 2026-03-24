import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCustomerDto, UpdateCustomerDto, CreditTransactionDto } from './dto/customer.dto'

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateCustomerDto) {
        return this.prisma.customer.create({
            data: { tenantId, ...dto },
        })
    }

    async findAll(tenantId: string, query: { search?: string; status?: string }) {
        return this.prisma.customer.findMany({
            where: {
                tenantId,
                status: query.status as any,
                OR: query.search ? [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { phone: { contains: query.search } },
                    { email: { contains: query.search, mode: 'insensitive' } },
                ] : undefined,
            },
            orderBy: { name: 'asc' },
        })
    }

    async findOne(tenantId: string, id: string) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, tenantId },
            include: {
                creditTransactions: { orderBy: { createdAt: 'desc' }, take: 20 },
                sales: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { lines: true },
                },
            },
        })
        if (!customer) throw new NotFoundException('Cliente no encontrado')
        return customer
    }

    async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
        await this.findOne(tenantId, id)
        return this.prisma.customer.update({ where: { id }, data: dto })
    }

    async charge(tenantId: string, id: string, dto: CreditTransactionDto) {
        const customer = await this.findOne(tenantId, id)
        const newBalance = Number(customer.creditBalance) + dto.amount

        if (newBalance > Number(customer.creditLimit)) {
            throw new BadRequestException('Supera el límite de crédito')
        }

        return this.prisma.$transaction(async tx => {
            const updated = await tx.customer.update({
                where: { id },
                data: { creditBalance: { increment: dto.amount } },
            })
            await tx.creditTransaction.create({
                data: { customerId: id, type: 'CHARGE', amount: dto.amount, note: dto.note },
            })
            return updated
        })
    }

    async payment(tenantId: string, id: string, dto: CreditTransactionDto) {
        const customer = await this.findOne(tenantId, id)
        if (Number(customer.creditBalance) === 0) {
            throw new BadRequestException('El cliente no tiene saldo pendiente')
        }

        return this.prisma.$transaction(async tx => {
            const updated = await tx.customer.update({
                where: { id },
                data: { creditBalance: { decrement: Math.min(dto.amount, Number(customer.creditBalance)) } },
            })
            await tx.creditTransaction.create({
                data: { customerId: id, type: 'PAYMENT', amount: dto.amount, note: dto.note },
            })
            return updated
        })
    }

    async addPoints(id: string, points: number) {
        return this.prisma.customer.update({
            where: { id },
            data: { loyaltyPoints: { increment: points } },
        })
    }
}