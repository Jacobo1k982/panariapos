'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { Check, Zap, Star, Building2 } from 'lucide-react'

interface PlanPrice {
  monthly:      number
  yearly:       number
  yearlySaving: number
  label:        string
  description:  string
  features:     string[]
  highlighted?: boolean
  icon:         any
  planKey:      string
}

const PLANS: PlanPrice[] = [
  {
    planKey:      'BASIC',
    label:        'Básico',
    description:  'Perfecto para empezar',
    icon:         Zap,
    monthly:      22,
    yearly:       212,
    yearlySaving: 44,
    features: [
      '1 sucursal',
      '3 usuarios',
      'POS completo',
      'Inventario básico',
      'Clientes y fiado',
      'Reportes básicos',
      'Soporte por email',
    ],
  },
  {
    planKey:      'PRO',
    label:        'Pro',
    description:  'Para negocios en crecimiento',
    icon:         Star,
    monthly:      53,
    yearly:       529,
    yearlySaving: 106,
    highlighted:  true,
    features: [
      '3 sucursales',
      '10 usuarios',
      'POS completo',
      'Inventario completo',
      'Clientes y fiado',
      'Reportes básicos y avanzados',
      'Módulo de producción',
      'Gestión de proveedores',
      'Soporte prioritario',
    ],
  },
  {
    planKey:      'ENTERPRISE',
    label:        'Enterprise',
    description:  'Para cadenas y franquicias',
    icon:         Building2,
    monthly:      127,
    yearly:       1268,
    yearlySaving: 254,
    features: [
      'Sucursales ilimitadas',
      'Usuarios ilimitados',
      'POS completo',
      'Inventario completo',
      'Clientes y fiado',
      'Reportes básicos y avanzados',
      'Módulo de producción',
      'Gestión de proveedores',
      'Soporte prioritario',
    ],
  },
]

export default function PlansPage() {
  const { user } = useAuthStore()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const currentPlan = (user as any)?.plan ?? 'BASIC'

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 40px)', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '10px' }}>
          Elegí tu plan
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '28px' }}>
          Empezá gratis y escalá cuando tu negocio lo necesite
        </p>

        {/* Toggle mensual/anual */}
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: 'var(--bg-overlay)', borderRadius: '100px',
          padding: '4px', border: '1px solid var(--border)', gap: '2px',
        }}>
          {(['monthly', 'yearly'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: '7px 20px', borderRadius: '100px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                border: 'none', transition: 'all 0.2s',
                background: billing === b ? 'var(--accent)' : 'transparent',
                color: billing === b ? '#0c0e14' : 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {b === 'monthly' ? 'Mensual' : 'Anual'}
              {b === 'yearly' && (
                <span style={{
                  marginLeft: '6px', fontSize: '10px', fontWeight: 700,
                  background: billing === 'yearly' ? 'rgba(0,0,0,0.15)' : 'var(--accent-bg)',
                  color: billing === 'yearly' ? '#0c0e14' : 'var(--accent)',
                  padding: '2px 6px', borderRadius: '100px',
                }}>
                  Ahorrás hasta $254
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        alignItems: 'start',
      }}>
        {PLANS.map(plan => {
          const Icon          = plan.icon
          const isCurrent     = currentPlan === plan.planKey
          const price         = billing === 'monthly' ? plan.monthly : plan.yearly
          const isHighlighted = plan.highlighted

          return (
            <div
              key={plan.planKey}
              style={{
                background:   isHighlighted ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border:       `1px solid ${isHighlighted ? 'var(--accent-border)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-xl)',
                padding:      '28px',
                position:     'relative',
                boxShadow:    isHighlighted
                  ? '0 0 0 1px var(--accent-border), 0 20px 60px rgba(245,166,35,0.08)'
                  : 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                if (!isHighlighted) {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)'
                }
              }}
              onMouseLeave={e => {
                if (!isHighlighted) {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                }
              }}
            >
              {/* Badge popular */}
              {isHighlighted && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  padding: '4px 16px', borderRadius: '100px',
                  background: 'var(--accent)', color: '#0c0e14',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>
                  ⭐ Más popular
                </div>
              )}

              {/* Badge plan actual */}
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  padding: '3px 10px', borderRadius: '100px',
                  background: 'var(--success-bg)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  fontSize: '10px', fontWeight: 700, color: 'var(--success)',
                }}>
                  ✓ Plan actual
                </div>
              )}

              {/* Icono y nombre */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '10px',
                  background: isHighlighted ? 'var(--accent-bg)' : 'var(--bg-overlay)',
                  border: `1px solid ${isHighlighted ? 'var(--accent-border)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={isHighlighted ? 'var(--accent)' : 'var(--text-muted)'} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em' }}>{plan.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{plan.description}</div>
                </div>
              </div>

              {/* Precio */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2px' }}>
                  <span style={{
                    fontSize: '18px', fontWeight: 700, color: 'var(--text-secondary)',
                    lineHeight: 1, marginTop: '8px',
                  }}>
                    $
                  </span>
                  <span style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>
                    {price}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {billing === 'monthly' ? 'por mes' : 'por año'}
                  {billing === 'yearly' && (
                    <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--success)' }}>
                      Ahorrás ${plan.yearlySaving}
                    </span>
                  )}
                </div>
                {/* Precio alternativo */}
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {billing === 'monthly'
                    ? `o $${plan.yearly}/año · ahorrás $${plan.yearlySaving}`
                    : `o $${plan.monthly}/mes`
                  }
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

              {/* Features */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--success-bg)',
                      border: '1px solid rgba(52,211,153,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: '1px',
                    }}>
                      <Check size={10} color="var(--success)" strokeWidth={3} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <div style={{
                  width: '100%', padding: '12px', textAlign: 'center',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-overlay)',
                  border: '1px solid var(--border)',
                  fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)',
                }}>
                  ✓ Plan actual
                </div>
              ) : (
                <button
                  onClick={() => window.open(
                    `mailto:ventas@panariapos.com?subject=Upgrade a ${plan.label}`,
                    '_blank'
                  )}
                  className={isHighlighted ? 'btn-accent' : 'btn-ghost'}
                  style={{
                    width: '100%', padding: '12px',
                    fontSize: '13px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  {plan.planKey === 'BASIC' ? 'Bajar a Básico' : `Actualizar a ${plan.label}`}
                  {isHighlighted && ' →'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Nota */}
      <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '13px', color: 'var(--text-muted)' }}>
        ¿Tenés dudas? Escribinos a{' '}
        <a href="mailto:ventas@panariapos.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
          jgutierrez@jacana-dev.com
        </a>
      </p>
    </div>
  )
}
