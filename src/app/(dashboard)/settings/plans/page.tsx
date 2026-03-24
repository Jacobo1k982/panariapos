'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Zap, Star, Crown, Check, X,
    ArrowRight, CheckCircle
} from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import toast from 'react-hot-toast'

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

export default function PlansPage() {
    const [annual, setAnnual] = useState(false)
    const [loading, setLoading] = useState('')
    const { data: tenant } = useTenant()
    const router = useRouter()

    const currentPlan = tenant?.plan ?? 'BASIC'

    const handleSelect = async (planId: string) => {
        if (planId === currentPlan) return
        setLoading(planId)
        try {
            await new Promise(r => setTimeout(r, 1200))
            toast.success(`Plan actualizado a ${planId}`)
            router.push('/settings')
        } catch {
            toast.error('Error al actualizar el plan')
        } finally {
            setLoading('')
        }
    }

    return (
        <div style={{ padding: '28px', maxWidth: '960px' }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                    Plan actual y facturación
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Gestioná tu suscripción y cambiá de plan cuando lo necesités
                </p>
            </div>

            {/* Plan actual */}
            {tenant && (
                <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    marginBottom: '28px',
                }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: '10px',
                        background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CheckCircle size={20} color="var(--accent)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                            Plan actual: <span style={{ color: 'var(--accent)' }}>{currentPlan}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {tenant.name} · Para cambiar de plan seleccioná uno abajo
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle mensual/anual */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: '40px', padding: '4px',
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

            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                {PLANS.map(plan => {
                    const Icon = plan.icon
                    const shown = annual ? plan.annual : plan.monthly
                    const isCurrent = plan.id === currentPlan
                    const isLoading = loading === plan.id

                    return (
                        <div
                            key={plan.id}
                            style={{
                                background: 'var(--bg-surface)',
                                border: `2px solid ${isCurrent ? plan.color : (plan as any).popular ? plan.border : 'var(--border)'}`,
                                borderRadius: 'var(--radius-xl)',
                                padding: '24px 20px',
                                position: 'relative',
                                opacity: isLoading ? 0.7 : 1,
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={e => {
                                if (!isCurrent)
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                            }}
                        >
                            {/* Badge plan actual */}
                            {isCurrent && (
                                <div style={{
                                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                    background: plan.color, color: '#fff',
                                    fontSize: '10px', fontWeight: 700, padding: '2px 12px',
                                    borderRadius: '20px', whiteSpace: 'nowrap',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                }}>
                                    ✓ Plan actual
                                </div>
                            )}

                            {/* Badge popular */}
                            {(plan as any).popular && !isCurrent && (
                                <div style={{
                                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                    background: 'var(--accent)', color: '#0f1117',
                                    fontSize: '10px', fontWeight: 700, padding: '2px 12px',
                                    borderRadius: '20px', whiteSpace: 'nowrap',
                                }}>
                                    ⭐ Más popular
                                </div>
                            )}

                            {/* Nombre e ícono */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: '9px',
                                    background: plan.bg, border: `1px solid ${plan.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={16} color={plan.color} />
                                </div>
                                <span style={{ fontSize: '16px', fontWeight: 700 }}>{plan.name}</span>
                            </div>

                            {/* Precio */}
                            <div style={{ marginBottom: '18px' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                                    <span style={{
                                        fontSize: '26px', fontWeight: 800,
                                        fontFamily: 'var(--font-mono)', color: plan.color,
                                        letterSpacing: '-1px',
                                    }}>
                                        {fmt(shown)}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        /{annual ? 'año' : 'mes'}
                                    </span>
                                </div>
                                {annual ? (
                                    <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '2px' }}>
                                        Ahorrás {fmt(plan.monthly * 2)}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        o {fmt(plan.annual)}/año
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '20px' }}>
                                {plan.features.map((f, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px',
                                    }}>
                                        {f.ok ? (
                                            <Check size={13} color="var(--success)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                                        ) : (
                                            <X size={13} color="var(--text-muted)" strokeWidth={2} style={{ flexShrink: 0 }} />
                                        )}
                                        <span style={{ color: f.ok ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                            {f.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Botón */}
                            <button
                                onClick={() => handleSelect(plan.id)}
                                disabled={isCurrent || isLoading}
                                style={{
                                    width: '100%', padding: '10px',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '13px', fontWeight: 600,
                                    cursor: isCurrent ? 'default' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                    background: isCurrent ? 'var(--bg-overlay)' : (plan as any).popular ? 'var(--accent)' : 'var(--bg-overlay)',
                                    color: isCurrent ? 'var(--text-muted)' : (plan as any).popular ? '#0f1117' : 'var(--text-primary)',
                                    border: `1px solid ${isCurrent ? 'var(--border)' : (plan as any).popular ? 'var(--accent)' : 'var(--border)'}`,
                                    opacity: isCurrent ? 0.6 : 1,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <span style={{
                                            width: 13, height: 13, borderRadius: '50%',
                                            border: '2px solid rgba(0,0,0,0.2)',
                                            borderTopColor: (plan as any).popular ? '#0f1117' : 'var(--text-primary)',
                                            animation: 'spin 0.7s linear infinite',
                                            display: 'inline-block',
                                        }} />
                                        Procesando...
                                    </>
                                ) : isCurrent ? (
                                    '✓ Plan actual'
                                ) : (
                                    <>Seleccionar <ArrowRight size={13} /></>
                                )}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Nota */}
            <div style={{
                marginTop: '20px', padding: '14px 16px',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px', color: 'var(--text-muted)',
                display: 'flex', gap: '8px', alignItems: 'flex-start',
            }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>💳</span>
                <span>
                    Los cambios de plan se aplican de inmediato. Si bajás de plan,
                    el crédito del período restante se aplica al nuevo plan.
                    Para pagos contactá a <strong>soporte@panariapos.com</strong>
                </span>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}