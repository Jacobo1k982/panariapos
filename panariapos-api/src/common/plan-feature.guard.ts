import {
  Injectable, CanActivate, ExecutionContext,
  ForbiddenException, SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../prisma/prisma.service'
import { getPlanLimits, PlanLimits } from './plan-limits'

export const PLAN_FEATURE_KEY = 'planFeature'
export const PlanFeature = (feature: keyof PlanLimits) =>
  SetMetadata(PLAN_FEATURE_KEY, feature)

@Injectable()
export class PlanFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<keyof PlanLimits>(
      PLAN_FEATURE_KEY,
      [ctx.getHandler(), ctx.getClass()],
    )
    if (!feature) return true

    const req  = ctx.switchToHttp().getRequest()
    const user = req.user
    if (!user?.tenantId) return false

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { plan: true },
    })
    if (!tenant) return false

    const limits = getPlanLimits(tenant.plan)
    const value  = limits[feature]

    if (typeof value === 'boolean' && !value) {
      throw new ForbiddenException(
        `Tu plan actual no incluye esta funcionalidad. Actualizá a Pro o Enterprise para acceder.`
      )
    }

    return true
  }
}
