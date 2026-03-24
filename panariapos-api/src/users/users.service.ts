import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    })
    if (exists) throw new ConflictException('El correo ya esta registrado')

    const passwordHash = await bcrypt.hash(dto.password, 12)

    return this.prisma.user.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        branchId: dto.branchId,
      },
      select: {
        id: true, name: true, email: true, role: true,
        branchId: true, active: true, createdAt: true,
        branch: { select: { name: true } },
      },
    })
  }

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      select: {
        id: true, name: true, email: true, role: true,
        active: true, lastLogin: true, createdAt: true,
        branch: { select: { id: true, name: true } },
      },
    })
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true, name: true, email: true, role: true,
        active: true, lastLogin: true, createdAt: true,
        branch: { select: { id: true, name: true } },
      },
    })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    return user
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id)
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, name: true, email: true, role: true,
        active: true, branchId: true,
      },
    })
  }

  async changePassword(tenantId: string, id: string, newPassword: string) {
    await this.findOne(tenantId, id)
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await this.prisma.user.update({ where: { id }, data: { passwordHash } })
    return { message: 'Contrasena actualizada' }
  }
}
