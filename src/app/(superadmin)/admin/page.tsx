"use client"
import { useState } from 'react'
import { useAdminMetrics, useAdminTenants, useAdminActivity } from "@/hooks/useAdmin"
import { formatCRC } from "@/lib/utils"
import {
    Building2, ShoppingBag, CheckCircle, XCircle,
    Crown, Star, Zap, LogIn, UserPlus,
    Activity, BarChart2, Users, RefreshCw,
} from "lucide-react"

const PLAN_CFG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    BASIC:      { label: "Básico",     color: "var(--text-secondary)", bg: "var(--bg-overlay)", icon: Zap    },
    PRO:        { label: "Pro",        color: "var(--accent)",         bg: "var(--accent-bg)",  icon: Star   },
    ENTERPRISE: { label: "Enterprise", color: "var(--success)",        bg: "var(--success-bg)", icon: Crown  },
}

type AdminTab = 'overview' | 'activity'

export default function AdminDashboard() {
    const [tab, setTab] = useState<AdminTab>('overview')
    const { data: metrics, isLoading: loadingM, refetch: refetchM } = useAdminMetrics()
    const { data: tenants = [], isLoading: loadingT }               = useAdminTenants()
    const { data: activity, isLoading: loadingA, refetch: refetchA } = useAdminActivity()

    return (
        <div style={{ padding: 'clamp(16px, 3vw, 28px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Panel de administración</h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Vista global de todos los negocios en la plataforma</p>
                </div>
                <button
                    onClick={() => { refetchM(); refetchA() }}
                    className="btn-ghost"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '12px' }}
                >
                    <RefreshCw size={13} /> Actualizar
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '4px', width: 'fit-content' }}>
                {[
                    { id: 'overview'  as const, icon: BarChart2, label: 'Resumen'   },
                    { id: 'activity'  as const, icon: Activity,  label: 'Actividad' },
                ].map(t => {
                    const Icon = t.icon
                    return (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                            background: tab === t.id ? 'var(--bg-overlay)' : 'transparent',
                            color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: tab === t.id ? '1px solid var(--border-hover)' : '1px solid transparent',
                            cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
                        }}>
                            <Icon size={14} /> {t.label}
                        </button>
                    )
                })}
            </div>

            {/* ── Tab: Resumen ── */}
            {tab === 'overview' && (
                <>
                    {/* KPI cards — 2 cols móvil, 4 desktop */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                        {[
                            { label: 'Total negocios',   value: loadingM ? '…' : metrics?.totalTenants ?? 0,                       sub: `${metrics?.activeTenants ?? 0} activos`,            color: 'var(--info)',    icon: <Building2 size={16} />   },
                            { label: 'Ventas este mes',  value: loadingM ? '…' : formatCRC(metrics?.totalSalesThisMonth ?? 0),     sub: `${metrics?.totalOrdersThisMonth ?? 0} órdenes`,     color: 'var(--accent)',  icon: <ShoppingBag size={16} />, mono: true },
                            { label: 'Negocios activos', value: loadingM ? '…' : metrics?.activeTenants ?? 0,                      sub: `de ${metrics?.totalTenants ?? 0} registrados`,      color: 'var(--success)', icon: <CheckCircle size={16} /> },
                            { label: 'Suspendidos',      value: loadingM ? '…' : (metrics?.totalTenants ?? 0) - (metrics?.activeTenants ?? 0), sub: 'Requieren atención', color: 'var(--danger)', icon: <XCircle size={16} /> },
                        ].map(k => (
                            <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: k.color, opacity: 0.8 }}>{k.icon}</span>
                                </div>
                                <div style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, marginBottom: '4px', fontFamily: k.mono ? 'var(--font-mono)' : 'var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {k.value}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>{k.label}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>{k.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Distribución por plan + negocios recientes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {/* Planes */}
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Distribución por plan</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['BASIC', 'PRO', 'ENTERPRISE'].map(plan => {
                                    const cfg   = PLAN_CFG[plan]
                                    const Icon  = cfg.icon
                                    const count = metrics?.byPlan?.find((p: any) => p.plan === plan)?._count?.id ?? 0
                                    const total = metrics?.totalTenants ?? 1
                                    const pct   = Math.round((count / total) * 100)
                                    return (
                                        <div key={plan}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Icon size={13} color={cfg.color} />
                                                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{cfg.label}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{count}</span>
                                                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '20px', color: cfg.color, background: cfg.bg }}>{pct}%</span>
                                                </div>
                                            </div>
                                            <div style={{ height: 5, background: 'var(--bg-overlay)', borderRadius: 3 }}>
                                                <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: cfg.color, transition: 'width 0.4s ease' }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Negocios recientes */}
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>Negocios recientes</div>
                                <a href="/admin/tenants" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Ver todos →</a>
                            </div>
                            {loadingT ? (
                                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Cargando...</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {(tenants as any[]).slice(0, 5).map((tenant: any) => {
                                        const pcfg = PLAN_CFG[tenant.plan] ?? PLAN_CFG.BASIC
                                        const Icon = pcfg.icon
                                        return (
                                            <div key={tenant.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '9px', background: pcfg.bg, border: `1px solid ${pcfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Icon size={15} color={pcfg.color} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tenant._count?.users ?? 0} usuarios</div>
                                                </div>
                                                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px', color: tenant.active ? 'var(--success)' : 'var(--danger)', background: tenant.active ? 'var(--success-bg)' : 'var(--danger-bg)', flexShrink: 0 }}>
                                                    {tenant.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ── Tab: Actividad ── */}
            {tab === 'activity' && (
                <>
                    {/* KPI actividad — 2 cols móvil, 4 desktop */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        {[
                            { label: 'Logins hoy',             value: loadingM ? '…' : metrics?.loginsToday         ?? 0, color: 'var(--accent)',  icon: <LogIn size={15} />     },
                            { label: 'Logins esta semana',      value: loadingM ? '…' : metrics?.loginsThisWeek      ?? 0, color: 'var(--info)',    icon: <LogIn size={15} />     },
                            { label: 'Registros hoy',           value: loadingM ? '…' : metrics?.registrationsToday  ?? 0, color: 'var(--success)', icon: <UserPlus size={15} />  },
                            { label: 'Registros este mes',      value: loadingM ? '…' : metrics?.registrationsThisMonth ?? 0, color: 'var(--success)', icon: <Users size={15} />  },
                        ].map(k => (
                            <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                                <span style={{ color: k.color, opacity: 0.8, display: 'block', marginBottom: '10px' }}>{k.icon}</span>
                                <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-1px' }}>{k.value}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{k.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Logins recientes + Registros recientes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>

                        {/* Logins recientes */}
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <LogIn size={15} color="var(--accent)" />
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>Logins recientes</span>
                            </div>
                            {loadingA ? (
                                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Cargando...</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' }}>
                                    {(activity?.recentLogins ?? []).map((log: any, i: number) => (
                                        <div key={log.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                                                {log.user?.name?.charAt(0).toUpperCase() ?? 'U'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {log.user?.name ?? 'Usuario'}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {log.user?.tenant?.name ?? '—'}
                                                </div>
                                            </div>
                                            <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                    {new Date(log.createdAt).toLocaleDateString('es-CR')}
                                                </div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                    {new Date(log.createdAt).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(activity?.recentLogins ?? []).length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Sin logins registrados aún</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Registros recientes */}
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <UserPlus size={15} color="var(--success)" />
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>Registros recientes</span>
                            </div>
                            {loadingA ? (
                                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Cargando...</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' }}>
                                    {(activity?.recentRegistrations ?? []).map((tenant: any) => {
                                        const pcfg = PLAN_CFG[tenant.plan] ?? PLAN_CFG.BASIC
                                        const Icon = pcfg.icon
                                        return (
                                            <div key={tenant.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ width: 30, height: 30, borderRadius: '9px', background: pcfg.bg, border: `1px solid ${pcfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Icon size={13} color={pcfg.color} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tenant._count?.users ?? 0} usuarios</div>
                                                </div>
                                                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                                    <div style={{ fontSize: '10px', fontWeight: 600, color: pcfg.color, padding: '1px 6px', background: pcfg.bg, borderRadius: '20px', marginBottom: '2px' }}>{pcfg.label}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                        {new Date(tenant.createdAt).toLocaleDateString('es-CR')}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {(activity?.recentRegistrations ?? []).length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Sin registros aún</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nota GA4 */}
                    <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <BarChart2 size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>
                                Analítica de la landing page
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                Las métricas de visitas, países, dispositivos y fuente de tráfico se gestionan desde{' '}
                                <a href="https://analytics.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                                    Google Analytics 4 →
                                </a>
                                {' '}configurado en la landing page. Asegurate de reemplazar <code style={{ background: 'var(--bg-overlay)', padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>G-XXXXXXXXXX</code> con tu Measurement ID real.
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
