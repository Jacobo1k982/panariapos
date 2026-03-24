import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { InventoryService } from '../inventory/inventory.service'

export class CreateRecipeDto {
    productId: string
    yield: number
    yieldUnit: string
    prepMinutes: number
    notes?: string
    ingredients: { itemId: string; quantity: number; unit: string }[]
}

export class CreateProductionOrderDto {
    recipeId: string
    batches: number
    scheduledAt?: string
    notes?: string
}

@Injectable()
export class ProductionService {
    constructor(
        private prisma: PrismaService,
        private inventory: InventoryService,
    ) { }

    // ── Recetas ─────────────────────────────────────────────────────────────────
    async createRecipe(tenantId: string, dto: CreateRecipeDto) {
        return this.prisma.recipe.create({
            data: {
                tenantId,
                productId: dto.productId,
                yield: dto.yield,
                yieldUnit: dto.yieldUnit,
                prepMinutes: dto.prepMinutes,
                notes: dto.notes,
                ingredients: {
                    create: dto.ingredients.map(i => ({
                        itemId: i.itemId,
                        quantity: i.quantity,
                        unit: i.unit as any,
                    })),
                },
            },
            include: { ingredients: { include: { item: true } }, product: true },
        })
    }

    async findRecipes(tenantId: string) {
        return this.prisma.recipe.findMany({
            where: { tenantId },
            include: { ingredients: { include: { item: true } }, product: true },
            orderBy: { product: { name: 'asc' } },
        })
    }

    async findRecipe(tenantId: string, id: string) {
        const recipe = await this.prisma.recipe.findFirst({
            where: { id, tenantId },
            include: { ingredients: { include: { item: true } }, product: true },
        })
        if (!recipe) throw new NotFoundException('Receta no encontrada')
        return recipe
    }

    // ── Órdenes de producción ────────────────────────────────────────────────────
    async createOrder(branchId: string, tenantId: string, dto: CreateProductionOrderDto) {
        const recipe = await this.findRecipe(tenantId, dto.recipeId)

        return this.prisma.productionOrder.create({
            data: {
                branchId,
                recipeId: recipe.id,
                batches: dto.batches,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
                notes: dto.notes,
            },
            include: { recipe: { include: { product: true } } },
        })
    }

    async findOrders(branchId: string, status?: string) {
        return this.prisma.productionOrder.findMany({
            where: { branchId, status: status as any },
            include: { recipe: { include: { product: true } } },
            orderBy: { scheduledAt: 'asc' },
        })
    }

    async startOrder(branchId: string, id: string) {
        const order = await this.prisma.productionOrder.findFirst({
            where: { id, branchId, status: 'PENDING' },
            include: { recipe: { include: { ingredients: true } } },
        })
        if (!order) throw new NotFoundException('Orden no encontrada o ya iniciada')

        // Verificar stock suficiente
        for (const ing of order.recipe.ingredients) {
            const item = await this.prisma.inventoryItem.findUnique({ where: { id: ing.itemId } })
            if (!item) throw new BadRequestException(`Ingrediente no encontrado`)
            const needed = Number(ing.quantity) * order.batches
            if (Number(item.quantity) < needed) {
                throw new BadRequestException(
                    `Stock insuficiente de ${item.name}. Necesario: ${needed} ${ing.unit}, disponible: ${item.quantity} ${ing.unit}`
                )
            }
        }

        return this.prisma.productionOrder.update({
            where: { id },
            data: { status: 'IN_PROGRESS' },
        })
    }

    async completeOrder(branchId: string, id: string) {
        const order = await this.prisma.productionOrder.findFirst({
            where: { id, branchId, status: 'IN_PROGRESS' },
            include: { recipe: { include: { ingredients: true } } },
        })
        if (!order) throw new NotFoundException('Orden no encontrada o no está en proceso')

        const producedQty = Number(order.recipe.yield) * order.batches

        // Descontar ingredientes del inventario
        const deductions = order.recipe.ingredients.map(ing => ({
            itemId: ing.itemId,
            quantity: Number(ing.quantity) * order.batches,
        }))
        await this.inventory.deductForProduction(branchId, deductions)

        return this.prisma.productionOrder.update({
            where: { id },
            data: { status: 'COMPLETED', completedAt: new Date(), producedQty },
            include: { recipe: { include: { product: true } } },
        })
    }

    async cancelOrder(branchId: string, id: string) {
        const order = await this.prisma.productionOrder.findFirst({
            where: { id, branchId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
        })
        if (!order) throw new NotFoundException('Orden no encontrada o no se puede cancelar')
        return this.prisma.productionOrder.update({ where: { id }, data: { status: 'CANCELLED' } })
    }
}