import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductDto, UpdateProductDto, CreateCategoryDto } from './dto/product.dto'
import { getPlanLimits } from '../common/plan-limits'

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ── Categorías ──────────────────────────────────────────────────────────────
  async createCategory(tenantId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { tenantId, name: dto.name, emoji: dto.emoji },
    })
  }

  async findCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
  }

  // ── Productos ───────────────────────────────────────────────────────────────
  async create(tenantId: string, dto: CreateProductDto) {
    // Verificar límite de productos según plan
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    })
    if (!tenant) throw new NotFoundException('Tenant no encontrado')

    const limits  = getPlanLimits(tenant.plan)
    const current = await this.prisma.product.count({
      where: { tenantId, active: true },
    })

    if (current >= limits.maxProducts) {
      throw new ForbiddenException(
        `Tu plan ${tenant.plan} permite un máximo de ${limits.maxProducts} productos. ` +
        `Actualizá tu plan para agregar más productos.`
      )
    }

    const exists = await this.prisma.product.findUnique({
      where: { tenantId_sku: { tenantId, sku: dto.sku } },
    })
    if (exists) throw new ConflictException(`SKU ${dto.sku} ya existe`)

    return this.prisma.product.create({
      data: { tenantId, ...dto },
      include: { category: true },
    })
  }

  async findAll(tenantId: string, query: { categoryId?: string; active?: boolean; search?: string }) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        active:     query.active ?? true,
        categoryId: query.categoryId,
        name:       query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        recipe: { include: { ingredients: { include: { item: true } } } },
      },
    })
    if (!product) throw new NotFoundException('Producto no encontrado')
    return product
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id)
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    })
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id)
    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    })
  }
}
