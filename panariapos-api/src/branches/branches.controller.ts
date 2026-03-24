import {
    Controller, Get, Post, Patch, Body,
    Param, UseGuards
} from '@nestjs/common'
import { BranchesService, CreateBranchDto } from './branches.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Role } from '@prisma/client'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('branches')
export class BranchesController {
    constructor(private branches: BranchesService) { }

    @Post()
    create(@CurrentUser() u: any, @Body() dto: CreateBranchDto) {
        return this.branches.create(u.tenantId, dto)
    }

    @Get()
    findAll(@CurrentUser() u: any) {
        return this.branches.findAll(u.tenantId)
    }

    @Get(':id')
    findOne(@CurrentUser() u: any, @Param('id') id: string) {
        return this.branches.findOne(u.tenantId, id)
    }

    @Patch(':id')
    update(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: Partial<CreateBranchDto>) {
        return this.branches.update(u.tenantId, id, dto)
    }
}