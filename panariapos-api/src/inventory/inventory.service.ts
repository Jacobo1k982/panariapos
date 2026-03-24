import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateInventoryItemDto, AdjustInventoryDto } from './dto/inventory.dto'

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async create(branchId: string, dto: CreateInventoryItemDto) {
        return this.prisma.inventoryItem.create({
            data: {
                branchId,
                name: dto.name,
                sku: dto.sku,
                category: dto.category,
                unit: dto.unit,
                quantity: dto.quantity,
                minStock: dto.minStock,
                costPerUnit: dto.costPerUnit,
                supplier: dto.supplier,
                expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
            },
        })
    }

    async findAll(branchId: string, query: { category?: string; alerts?: boolean }) {
        const items = await this.prisma.inventoryItem.findMany({
            where: {
                branchId,
                category: query.category as any,
            },
            orderBy: { name: 'asc' },
        })

        if (query.alerts) {
            return items.filter(i => Number(i.quantity) <= Number(i.minStock))
        }
        return items
    }

    async findOne(branchId: string, id: string) {
        const item = await this.prisma.inventoryItem.findFirst({
            where: { id, branchId },
            include: { inventoryAdjustments: { orderBy: { createdAt: 'desc' }, take: 10 } },
        })
        if (!item) throw new NotFoundException('Ítem no encontrado')
        return item
    }

    async update(branchId: string, id: string, dto: Partial<CreateInventoryItemDto>) {
        await this.findOne(branchId, id)
        return this.prisma.inventoryItem.update({ where: { id }, data: dto })
    }

    async adjust(branchId: string, id: string, dto: AdjustInventoryDto) {
        await this.findOne(branchId, id)

        return this.prisma.$transaction(async tx => {
            const item = await tx.inventoryItem.update({
                where: { id },
                data: { quantity: { increment: dto.delta } },
            })
            await tx.inventoryAdjustment.create({
                data: { itemId: id, delta: dto.delta, reason: dto.reason },
            })
            return item
        })
    }

    async getAlerts(branchId: string) {
        const now = new Date()
        const in7d = new Date(now.getTime() + 7 * 86400000)
        const items = await this.prisma.inventoryItem.findMany({ where: { branchId } })

        return {
            lowStock: items.filter(i => Number(i.quantity) <= Number(i.minStock)),
            expiring: items.filter(i => i.expiryDate && i.expiryDate <= in7d && i.expiryDate >= now),
            expired: items.filter(i => i.expiryDate && i.expiryDate < now),
        }
    }

    // Descuento automático al producir (llamado desde ProductionService)
    async deductForProduction(branchId: string, ingredients: { itemId: string; quantity: number }[]) {
        return this.prisma.$transaction(
            ingredients.map(ing =>
                this.prisma.inventoryItem.update({
                    where: { id: ing.itemId },
                    data: { quantity: { decrement: ing.quantity } },
                })
            )
        )
    }
}