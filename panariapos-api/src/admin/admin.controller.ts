import {
    Controller, Get, Patch, Param, Body,
    Query, UseGuards
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role, Plan } from '@prisma/client'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private admin: AdminService) { }

    @Get('metrics')
    getMetrics() {
        return this.admin.getMetrics()
    }

    @Get('tenants')
    getAllTenants(
        @Query('active') active?: string,
        @Query('plan') plan?: Plan,
    ) {
        return this.admin.getAllTenants({
            active: active !== undefined ? active === 'true' : undefined,
            plan,
        })
    }

    @Get('tenants/:id')
    getTenant(@Param('id') id: string) {
        return this.admin.getTenant(id)
    }

    @Patch('tenants/:id/plan')
    updatePlan(@Param('id') id: string, @Body('plan') plan: Plan) {
        return this.admin.updatePlan(id, plan)
    }

    @Patch('tenants/:id/toggle')
    toggleTenant(@Param('id') id: string, @Body('active') active: boolean) {
        return this.admin.toggleTenant(id, active)
    }
}