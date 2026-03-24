import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export class CreateBranchDto {
    name: string
    address?: string
    phone?: string
}

@Injectable()
export class BranchesService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateBranchDto) {
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