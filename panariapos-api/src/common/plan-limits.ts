import { Plan } from '@prisma/client'

export interface PlanLimits {
  maxBranches: number
  maxUsers: number
  maxProducts: number
  hasProduction: boolean
  hasSuppliers: boolean
  hasAdvancedReports: boolean
  hasMultibranch: boolean
  supportType: 'email' | 'priority' | 'whatsapp'
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  BASIC: {
    maxBranches:         1,
    maxUsers:            3,
    maxProducts:         100,
    hasProduction:       false,
    hasSuppliers:        false,
    hasAdvancedReports:  false,
    hasMultibranch:      false,
    supportType:         'email',
  },
  PRO: {
    maxBranches:        3,
    maxUsers:           10,
    maxProducts:        Infinity,
    hasProduction:      true,
    hasSuppliers:       true,
    hasAdvancedReports: true,
    hasMultibranch:     true,
    supportType:        'priority',
  },
  ENTERPRISE: {
    maxBranches:        Infinity,
    maxUsers:           Infinity,
    maxProducts:        Infinity,
    hasProduction:      true,
    hasSuppliers:       true,
    hasAdvancedReports: true,
    hasMultibranch:     true,
    supportType:        'priority',
  },
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan]
}
