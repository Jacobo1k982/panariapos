import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Role } from '@prisma/client'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateUserDto) {
    return this.users.create(user.tenantId, dto)
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.users.findAll(user.tenantId)
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.users.findOne(user.tenantId, id)
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(user.tenantId, id, dto)
  }

  @Patch(':id/password')
  changePassword(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.users.changePassword(user.tenantId, id, password)
  }
}
