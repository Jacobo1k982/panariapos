'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Zap, Check, X, Star, Crown, ArrowRight, ChevronDown } from 'lucide-react'

function fmt(n: number) { return `$${n.toLocaleString('en-US')}` }

const PLANS = [
    {
        id: 'BASIC', name: 'Básico', icon: Zap,
        color: 'var(--text-secondary)', bg: 'var(--bg-overlay)',
        border: 'var(--border)', monthly: 22, annual: 212, popular: false,
        features: [
            { text: '1 sucursal',          ok: true  },
            { text: '3 usuarios',           ok: true  },
            { text: 'POS completo',         ok: true  },
            { text: 'Inventario',           ok: true  },
            { text: 'Clientes y fiado',     ok: true  },
            { text: 'Reportes básicos',     ok: true  },
            { text: 'Reportes avanzados',   ok: false },
            { text: 'Soporte prioritario',  ok: false },
        ],
    },
    {
        id: 'PRO', name: 'Pro', icon: Star,
        color: 'var(--accent)', bg: 'var(--accent-bg)',
        border: 'var(--accent-border)', monthly: 53, annual: 529, popular: true,
        features: [
            { text: '3 sucursales',         ok: true  },
            { text: '10 usuarios',          ok: true  },
            { text: 'POS completo',         ok: true  },
            { text: 'Inventario',           ok: true  },
            { text: 'Clientes y fiado',     ok: true  },
            { text: 'Reportes básicos',     ok: true  },
            { text: 'Reportes avanzados',   ok: true  },
            { text: 'Soporte prioritario',  ok: false },
        ],
    },
    {
        id: 'ENTERPRISE', name: 'Enterprise', icon: Crown,
        color: 'var(--success)', bg: 'var(--success-bg)',
        border: 'rgba(52,211,153,0.25)', monthly: 127, annual: 1268, popular: false,
        features: [
            { text: 'Sucursales ilimitadas', ok: true },
            { text: 'Usuarios ilimitados',   ok: true },
            { text: 'POS completo',          ok: true },
            { text: 'Inventario',            ok: true },
            { text: 'Clientes y fiado',      ok: true },
            { text: 'Reportes básicos',      ok: true },
            { text: 'Reportes avanzados',    ok: true },
            { text: 'Soporte prioritario',   ok: true },
        ],
    },
]

export default function PricingPage() {
    const [annual,   setAnnual]   = useState(false)
    const [expanded, setExpanded] = useState<string | null>('PRO')

    const toggle = (id: string) => setExpanded(prev => prev === id ? null : id)

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: 'clamp(24px, 5vw, 48px) 16px' }}>

            {/* Fondo decorativo */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{
                    position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
                    width: '800px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)',
                }} />
            </div>

            <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <div style={{
                            width: 36, height: 36, background: 'var(--accent)',
                            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(245,166,35,0.3)',
                        }}>
                            <Zap size={18} color="#0f1117" strokeWidth={2.5} />
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>PanariaPOS</span>
                    </Link>

                    <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, marginBottom: '10px', lineHeight: '1.2', letterSpacing: '-0.03em' }}>
                        Planes y precios
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                        Elegí el plan que mejor se adapte a tu negocio.
                        Todos incluyen 15 días de prueba gratis.
                    </p>

                    {/* Toggle mensual/anual */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: '40px', padding: '4px',
                    }}>
                        <button
                            onClick={() => setAnnual(false)}
                            style={{
                                padding: '7px 18px', borderRadius: '30px', fontSize: '13px', fontWeight: 500,
                                background: !annual ? 'var(--accent)' : 'transparent',
                                border: 'none',
                                color: !annual ? '#0f1117' : 'var(--text-muted)',
                                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
                            }}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            style={{
                                padding: '7px 18px', borderRadius: '30px', fontSize: '13px', fontWeight: 500,
                                background: annual ? 'var(--accent)' : 'transparent',
                                border: 'none',
                                color: annual ? '#0f1117' : 'var(--text-muted)',
                                cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sans)',
                            }}
                        >
                            Anual
                            <span style={{
                                fontSize: '10px', fontWeight: 700,
                                background: annual ? 'rgba(0,0,0,0.15)' : 'var(--accent-bg)',
                                color: annual ? '#0f1117' : 'var(--accent)',
                                padding: '2px 7px', borderRadius: '20px',
                            }}>
                                2 meses gratis
                            </span>
                        </button>
                    </div>
                </div>

                {/* Cards colapsables */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                    {PLANS.map(plan => {
                        const Icon     = plan.icon
                        const shown    = annual ? plan.annual : plan.monthly
                        const isOpen   = expanded === plan.id

                        return (
                            <div
                                key={plan.id}
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: `1.5px solid ${plan.popular && isOpen ? plan.border : isOpen ? 'var(--border-hover)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-xl)',
                                    overflow: 'hidden',
                                    transition: 'border-color 0.2s',
                                    position: 'relative',
                                }}
                            >
                                {/* Badge popular */}
                                {plan.popular && (
                                    <div style={{
                                        position: 'absolute', top: 0, right: 0,
                                        background: 'var(--accent)', color: '#0f1117',
                                        fontSize: '10px', fontWeight: 700,
                                        padding: '4px 12px',
                                        borderRadius: '0 var(--radius-xl) 0 var(--radius-md)',
                                    }}>
                                        ⭐ Popular
                                    </div>
                                )}

                                {/* Header del card — siempre visible */}
                                <button
                                    onClick={() => toggle(plan.id)}
                                    style={{
                                        width: '100%', background: 'none', border: 'none',
                                        cursor: 'pointer', padding: '18px 20px',
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                        textAlign: 'left',
                                    }}
                                >
                                    {/* Icono */}
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                                        background: plan.bg, border: `1px solid ${plan.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon size={18} color={plan.color} />
                                    </div>

                                    {/* Nombre y precio */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                            {plan.name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                            <span style={{ fontSize: '22px', fontWeight: 800, color: plan.color, fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px' }}>
                                                {fmt(shown)}
                                            </span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                /{annual ? 'año' : 'mes'}
                                            </span>
                                            {annual && (
                                                <span style={{ fontSize: '11px', color: 'var(--success)', marginLeft: '4px', fontWeight: 600 }}>
                                                    Ahorrás {fmt(plan.monthly * 2)}
                                                </span>
                                            )}
                                            {!annual && (
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                                                    o {fmt(plan.annual)}/año
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Chevron */}
                                    <ChevronDown
                                        size={18}
                                        color="var(--text-muted)"
                                        style={{
                                            flexShrink: 0,
                                            transition: 'transform 0.25s',
                                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        }}
                                    />
                                </button>

                                {/* Contenido expandible */}
                                <div style={{
                                    maxHeight: isOpen ? '600px' : '0',
                                    overflow: 'hidden',
                                    transition: 'max-height 0.3s ease',
                                }}>
                                    <div style={{ padding: '0 20px 20px' }}>

                                        {/* Divider */}
                                        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '16px' }} />

                                        {/* Features */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                            {plan.features.map((f, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                                    <div style={{
                                                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                                        background: f.ok ? 'var(--success-bg)' : 'var(--bg-overlay)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        {f.ok
                                                            ? <Check size={10} color="var(--success)" strokeWidth={2.5} />
                                                            : <X size={10} color="var(--text-muted)" strokeWidth={2} />
                                                        }
                                                    </div>
                                                    <span style={{ color: f.ok ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                        {f.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA */}
                                        <Link
                                            href="/register"
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                padding: '12px', borderRadius: 'var(--radius-md)',
                                                fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                                                background: plan.popular ? 'var(--accent)' : 'var(--bg-overlay)',
                                                color: plan.popular ? '#0f1117' : 'var(--text-primary)',
                                                border: `1px solid ${plan.popular ? 'var(--accent)' : 'var(--border)'}`,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            Empezar gratis <ArrowRight size={15} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Garantía */}
                <div style={{
                    textAlign: 'center', padding: '20px',
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    marginBottom: '24px',
                }}>
                    <div style={{ fontSize: '22px' }}>🔒</div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>15 días de prueba gratuita</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: '1.5' }}>
                        Sin tarjeta de crédito. Cancelá cuando quieras.
                        Todos los planes incluyen acceso completo durante el período de prueba.
                    </div>
                </div>

                {/* Links */}
                <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px' }}>
                    <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                        Ya tengo cuenta →
                    </Link>
                    <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                        Registrar mi negocio →
                    </Link>
                </div>
            </div>

            <style>{`
                @media (max-width: 480px) {
                    h1 { font-size: 22px !important; }
                }
            `}</style>
        </div>
    )
}
