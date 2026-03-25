import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common'
import { TenantsService, UpdateTenantDto, RegisterTenantDto } from './tenants.service'
import { JwtAuthGuard }  from '../auth/guards/jwt.guard'
import { RolesGuard }    from '../auth/guards/roles.guard'
import { Roles }         from '../auth/decorators/roles.decorator'
import { CurrentUser }   from '../auth/decorators/current-user.decorator'
import { Role }          from '@prisma/client'

@Controller('tenants')
export class TenantsController {
  constructor(private tenants: TenantsService) {}

  @Post('register')
  register(@Body() dto: RegisterTenantDto) {
    return this.tenants.register(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() u: any) {
    return this.tenants.findOne(u.tenantId)
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('me')
  updateMe(@CurrentUser() u: any, @Body() dto: UpdateTenantDto) {
    return this.tenants.update(u.tenantId, dto)
  }
}
