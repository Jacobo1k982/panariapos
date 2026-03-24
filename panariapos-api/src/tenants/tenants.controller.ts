import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { TenantsService, UpdateTenantDto }          from './tenants.service'
import { JwtAuthGuard }                             from '../auth/guards/jwt.guard'
import { RolesGuard }                               from '../auth/guards/roles.guard'
import { Roles }                                    from '../auth/decorators/roles.decorator'
import { CurrentUser }                              from '../auth/decorators/current-user.decorator'
import { Role }                                     from '@prisma/client'

@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenants: TenantsService) {}

  // Obtener datos del tenant actual
  @Get('me')
  getMe(@CurrentUser() u: any) {
    return this.tenants.findOne(u.tenantId)
  }

  // Actualizar datos del tenant
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Patch('me')
  updateMe(@CurrentUser() u: any, @Body() dto: UpdateTenantDto) {
    return this.tenants.update(u.tenantId, dto)
  }
}
