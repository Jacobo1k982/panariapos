export interface PlanPrice {
  monthly:      number | null
  yearly:       number
  yearlySaving: number
  label:        string
  description:  string
  features:     string[]
  highlighted?: boolean
}

export const PLAN_PRICING: Record<string, PlanPrice> = {
  BASIC: {
    monthly:      null,        // gratis mensual
    yearly:       212,
    yearlySaving: 44,
    label:        'Básico',
    description:  'Perfecto para empezar',
    features: [
      '1 sucursal',
      '3 usuarios',
      'POS completo',
      'Inventario',
      'Clientes y fiado',
      'Reportes básicos',
      'Soporte por email',
    ],
  },
  PRO: {
    monthly:      53,
    yearly:       529,
    yearlySaving: 106,
    label:        'Pro',
    description:  'Para negocios en crecimiento',
    highlighted:  true,
    features: [
      '3 sucursales',
      '10 usuarios',
      'POS completo',
      'Inventario',
      'Clientes y fiado',
      'Reportes básicos y avanzados',
      'Soporte prioritario',
    ],
  },
  ENTERPRISE: {
    monthly:      127,
    yearly:       1268,
    yearlySaving: 254,
    label:        'Enterprise',
    description:  'Para cadenas y franquicias',
    features: [
      'Sucursales ilimitadas',
      'Usuarios ilimitados',
      'POS completo',
      'Inventario',
      'Clientes y fiado',
      'Reportes básicos y avanzados',
      'Soporte prioritario',
    ],
  },
}
