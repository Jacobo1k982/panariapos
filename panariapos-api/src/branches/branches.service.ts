import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { getPlanLimits } from '../common/plan-limits'

export class CreateBranchDto {
  name: string
  address?: string
  phone?: string
}

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateBranchDto) {
    // Verificar límite de sucursales según plan
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    })
    if (!tenant) throw new NotFoundException('Tenant no encontrado')

    const limits  = getPlanLimits(tenant.plan)
    const current = await this.prisma.branch.count({
      where: { tenantId, active: true },
    })

    if (current >= limits.maxBranches) {
      throw new ForbiddenException(
        `Tu plan ${tenant.plan} permite un máximo de ${limits.maxBranches} sucursal${limits.maxBranches !== 1 ? 'es' : ''}. ` +
        `Actualizá tu plan para agregar más sucursales.`
      )
    }

    return this.prisma.branch.create({ data: { tenantId, ...dto } })
  }

  async findAll(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, active: true },
      include: {
        _count: { select: { sales: true, users: true } },
      },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId },
      include: { users: { select: { id: true, name: true, role: true } } },
    })
    if (!branch) throw new NotFoundException('Sucursal no encontrada')
    return branch
  }

  async update(tenantId: string, id: string, dto: Partial<CreateBranchDto>) {
    await this.findOne(tenantId, id)
    return this.prisma.branch.update({ where: { id }, data: dto })
  }
}
