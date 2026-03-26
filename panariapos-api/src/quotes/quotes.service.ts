import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto'

@Injectable()
export class QuotesService {
    constructor(private prisma: PrismaService) {}

    // ── Generar número de cotización ─────────────────────────────────────────
    private async generateQuoteNumber(tenantId: string): Promise<string> {
        const count = await this.prisma.quote.count({ where: { tenantId } })
        const num   = String(count + 1).padStart(4, '0')
        return `COT-${num}`
    }

    // ── Crear cotización ─────────────────────────────────────────────────────
    async create(tenantId: string, userId: string, dto: CreateQuoteDto) {
        const quoteNumber = await this.generateQuoteNumber(tenantId)

        const subtotal = dto.lines.reduce((acc, l) => {
            const lineSubtotal = l.quantity * l.unitPrice * (1 - (l.discount ?? 0) / 100)
            return acc + lineSubtotal
        }, 0)

        const discountAmt = subtotal * ((dto.discount ?? 0) / 100)
        const total       = subtotal - discountAmt

        return this.prisma.quote.create({
            data: {
                tenantId,
                quoteNumber,
                customerId:  dto.customerId,
                discount:    dto.discount ?? 0,
                subtotal,
                total,
                notes:       dto.notes,
                validUntil:  dto.validUntil ? new Date(dto.validUntil) : null,
                createdById: userId,
                lines: {
                    create: dto.lines.map(l => ({
                        productId:   l.productId,
                        productName: l.productName,
                        quantity:    l.quantity,
                        unitPrice:   l.unitPrice,
                        discount:    l.discount ?? 0,
                        subtotal:    l.quantity * l.unitPrice * (1 - (l.discount ?? 0) / 100),
                    })),
                },
            },
            include: {
                lines:    true,
                customer: { select: { id: true, name: true, phone: true, email: true } },
            },
        })
    }

    // ── Listar cotizaciones ──────────────────────────────────────────────────
    async findAll(tenantId: string, query: { status?: string; customerId?: string; search?: string }) {
        return this.prisma.quote.findMany({
            where: {
                tenantId,
                status:     query.status as any,
                customerId: query.customerId,
                OR: query.search ? [
                    { quoteNumber: { contains: query.search, mode: 'insensitive' } },
                    { customer: { name: { contains: query.search, mode: 'insensitive' } } },
                ] : undefined,
            },
            include: {
                customer: { select: { id: true, name: true, phone: true } },
                lines:    { select: { id: true, productName: true, quantity: true, unitPrice: true, subtotal: true } },
                _count:   { select: { lines: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    // ── Obtener una cotización ───────────────────────────────────────────────
    async findOne(tenantId: string, id: string) {
        const quote = await this.prisma.quote.findFirst({
            where: { id, tenantId },
            include: {
                lines:    { include: { product: { select: { id: true, name: true, sku: true } } } },
                customer: true,
            },
        })
        if (!quote) throw new NotFoundException('Cotización no encontrada')
        return quote
    }

    // ── Actualizar estado / datos ────────────────────────────────────────────
    async update(tenantId: string, id: string, dto: UpdateQuoteDto) {
        await this.findOne(tenantId, id)
        return this.prisma.quote.update({
            where: { id },
            data: {
                ...dto,
                validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
            },
            include: {
                lines:    true,
                customer: { select: { id: true, name: true, phone: true, email: true } },
            },
        })
    }

    // ── Convertir cotización en venta ────────────────────────────────────────
    async convertToSale(tenantId: string, id: string, cashRegisterId: string, paymentMethod: string) {
        const quote = await this.findOne(tenantId, id)

        if (quote.status === 'CONVERTED') {
            throw new BadRequestException('Esta cotización ya fue convertida en venta')
        }
        if (quote.status === 'REJECTED') {
            throw new BadRequestException('No se puede convertir una cotización rechazada')
        }

        // Obtener la sucursal del registro de caja
        const cashRegister = await this.prisma.cashRegister.findUnique({
            where: { id: cashRegisterId },
            select: { branchId: true, userId: true },
        })
        if (!cashRegister) throw new NotFoundException('Registro de caja no encontrado')

        // Generar número de recibo
        const saleCount = await this.prisma.sale.count({ where: { branchId: cashRegister.branchId } })
        const receiptNumber = `REC-${String(saleCount + 1).padStart(5, '0')}`

        return this.prisma.$transaction(async tx => {
            // Crear la venta
            const sale = await tx.sale.create({
                data: {
                    branchId:       cashRegister.branchId,
                    userId:         cashRegister.userId,
                    customerId:     quote.customerId,
                    cashRegisterId,
                    receiptNumber,
                    subtotal:       quote.subtotal,
                    discount:       quote.discount,
                    total:          quote.total,
                    paymentMethod:  paymentMethod.toUpperCase() as any,
                    status:         'COMPLETED',
                    notes:          `Convertida de cotización ${quote.quoteNumber}`,
                    lines: {
                        create: quote.lines.map(l => ({
                            productId:   l.productId,
                            productName: l.productName,
                            quantity:    l.quantity,
                            unitPrice:   l.unitPrice,
                            discount:    l.discount,
                            subtotal:    l.subtotal,
                        })),
                    },
                },
                include: { lines: true },
            })

            // Marcar cotización como convertida
            await tx.quote.update({
                where: { id },
                data: { status: 'CONVERTED', convertedSaleId: sale.id },
            })

            return sale
        })
    }

    // ── Expirar cotizaciones vencidas ────────────────────────────────────────
    async expireOldQuotes() {
        return this.prisma.quote.updateMany({
            where: {
                status:    'PENDING',
                validUntil: { lt: new Date() },
            },
            data: { status: 'EXPIRED' },
        })
    }
}
