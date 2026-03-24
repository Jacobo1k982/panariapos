'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Zap, Check, X, Star, Crown, ArrowRight } from 'lucide-react'


function fmt(n: number) {
  return `$${n.toLocaleString('en-US')}`
}

const PLANS = [
    {
        id: 'BASIC',
        name: 'Básico',
        icon: Zap,
        color: 'var(--text-secondary)',
        bg: 'var(--bg-overlay)',
        border: 'var(--border)',
        monthly: 22,
        annual: 212,
        popular: false,
        features: [
            { text: '1 sucursal', ok: true },
            { text: '3 usuarios', ok: true },
            { text: 'POS completo', ok: true },
            { text: 'Inventario', ok: true },
            { text: 'Clientes y fiado', ok: true },
            { text: 'Reportes básicos', ok: true },
            { text: 'Reportes avanzados', ok: false },
            { text: 'Soporte prioritario', ok: false },
        ],
    },
    {
        id: 'PRO',
        name: 'Pro',
        icon: Star,
        color: 'var(--accent)',
        bg: 'var(--accent-bg)',
        border: 'var(--accent-border)',
        monthly: 53,
        annual: 529,
        popular: true,
        features: [
            { text: '3 sucursales', ok: true },
            { text: '10 usuarios', ok: true },
            { text: 'POS completo', ok: true },
            { text: 'Inventario', ok: true },
            { text: 'Clientes y fiado', ok: true },
            { text: 'Reportes básicos', ok: true },
            { text: 'Reportes avanzados', ok: true },
            { text: 'Soporte prioritario', ok: false },
        ],
    },
    {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        icon: Crown,
        color: 'var(--success)',
        bg: 'var(--success-bg)',
        border: 'rgba(52,211,153,0.25)',
        monthly: 127,
        annual: 1268,
        popular: false,
        features: [
            { text: 'Sucursales ilimitadas', ok: true },
            { text: 'Usuarios ilimitados', ok: true },
            { text: 'POS completo', ok: true },
            { text: 'Inventario', ok: true },
            { text: 'Clientes y fiado', ok: true },
            { text: 'Reportes básicos', ok: true },
            { text: 'Reportes avanzados', ok: true },
            { text: 'Soporte prioritario', ok: true },
        ],
    },
]

export default function PricingPage() {
    const [annual, setAnnual] = useState(false)

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-base)',
            padding: '40px 20px',
        }}>

            {/* Fondo decorativo */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{
                    position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
                    width: '800px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)',
                }} />
            </div>

            <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                        <div style={{
                            width: 36, height: 36, background: 'var(--accent)',
                            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Zap size={18} color="#0f1117" strokeWidth={2.5} />
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>PanariaPOS</span>
                    </Link>

                    <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', lineHeight: '1.2' }}>
                        Planes y precios
                    </h1>
                    <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
                        Elegí el plan que mejor se adapte a tu negocio.
                        Todos incluyen 14 días de prueba gratis.
                    </p>

                    {/* Toggle mensual/anual */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '12px',
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: '40px', padding: '4px 6px',
                    }}>
                        <button
                            onClick={() => setAnnual(false)}
                            style={{
                                padding: '7px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: 500,
                                background: !annual ? 'var(--bg-overlay)' : 'transparent',
                                border: !annual ? '1px solid var(--border-hover)' : '1px solid transparent',
                                color: !annual ? 'var(--text-primary)' : 'var(--text-muted)',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            style={{
                                padding: '7px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: 500,
                                background: annual ? 'var(--accent)' : 'transparent',
                                border: annual ? 'none' : '1px solid transparent',
                                color: annual ? '#0f1117' : 'var(--text-muted)',
                                cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '6px',
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

                {/* Cards de planes */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                    gap: '20px', marginBottom: '48px',
                }}>
                    {PLANS.map(plan => {
                        const Icon = plan.icon
                        const price = annual ? plan.annual : plan.monthly * 12 / 12
                        const shown = annual ? plan.annual : plan.monthly

                        return (
                            <div
                                key={plan.id}
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: `2px solid ${plan.popular ? plan.border : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '28px 24px',
                                    position: 'relative',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'}
                                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}
                            >
                                {/* Badge popular */}
                                {plan.popular && (
                                    <div style={{
                                        position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                                        background: 'var(--accent)', color: '#0f1117',
                                        fontSize: '11px', fontWeight: 700, padding: '3px 14px',
                                        borderRadius: '20px', whiteSpace: 'nowrap',
                                    }}>
                                        ⭐ Más popular
                                    </div>
                                )}

                                {/* Icono y nombre */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: '10px',
                                        background: plan.bg, border: `1px solid ${plan.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon size={18} color={plan.color} />
                                    </div>
                                    <span style={{ fontSize: '17px', fontWeight: 700 }}>{plan.name}</span>
                                </div>

                                {/* Precio */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                        <span style={{
                                            fontSize: '32px', fontWeight: 800,
                                            fontFamily: 'var(--font-mono)', color: plan.color,
                                            letterSpacing: '-1px',
                                        }}>
                                            {fmt(shown)}
                                        </span>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            /{annual ? 'año' : 'mes'}
                                        </span>
                                    </div>
                                    {annual && (
                                        <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '3px', fontWeight: 500 }}>
                                            Ahorrás {fmt(plan.monthly * 2)} al año
                                        </div>
                                    )}
                                    {!annual && (
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                            o {fmt(plan.annual)}/año
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                                    {plan.features.map((f, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
                                        }}>
                                            {f.ok ? (
                                                <div style={{
                                                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                                    background: 'var(--success-bg)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Check size={11} color="var(--success)" strokeWidth={2.5} />
                                                </div>
                                            ) : (
                                                <div style={{
                                                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                                    background: 'var(--bg-overlay)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <X size={11} color="var(--text-muted)" strokeWidth={2} />
                                                </div>
                                            )}
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
                        )
                    })}
                </div>

                {/* Garantía */}
                <div style={{
                    textAlign: 'center', padding: '24px',
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                }}>
                    <div style={{ fontSize: '24px' }}>🔒</div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>
                        14 días de prueba gratuita
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px' }}>
                        Sin tarjeta de crédito. Cancelá cuando quieras.
                        Todos los planes incluyen acceso completo durante el período de prueba.
                    </div>
                </div>

                {/* Links */}
                <div style={{
                    textAlign: 'center', marginTop: '28px',
                    display: 'flex', justifyContent: 'center', gap: '20px',
                    fontSize: '13px',
                }}>
                    <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                        Ya tengo cuenta →
                    </Link>
                    <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                        Registrar mi negocio →
                    </Link>
                </div>
            </div>
        </div>
    )
}
