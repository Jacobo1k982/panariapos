'use client'
import { useAdminMetrics, useAdminTenants } from '@/hooks/useAdmin'
import { formatCRC } from '@/lib/utils'
import { TrendingUp, Building2, ShoppingBag, Users } from 'lucide-react'

export default function AdminReportsPage() {
    const { data: metrics } = useAdminMetrics()
    const { data: tenants = [] } = useAdminTenants()

    const activePct = metrics?.totalTenants > 0
        ? Math.round((metrics.activeTenants / metrics.totalTenants) * 100)
        : 0

    return (
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                    Reportes globales
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Métricas consolidadas de toda la plataforma
                </p>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
                {[
                    {
                        label: 'Ingresos este mes',
                        value: formatCRC(metrics?.totalSalesThisMonth ?? 0),
                        sub: `${metrics?.totalOrdersThisMonth ?? 0} órdenes`,
                        color: 'var(--accent)', icon: <TrendingUp size={18} />, mono: true,
                    },
                    {
                        label: 'Total negocios',
                        value: metrics?.totalTenants ?? 0,
                        sub: `${activePct}% activos`,
                        color: 'var(--info)', icon: <Building2 size={18} />,
                    },
                    {
                        label: 'Negocios activos',
                        value: metrics?.activeTenants ?? 0,
                        sub: `de ${metrics?.totalTenants ?? 0} registrados`,
                        color: 'var(--success)', icon: <Building2 size={18} />,
                    },
                    {
                        label: 'Órdenes este mes',
                        value: metrics?.totalOrdersThisMonth ?? 0,
                        sub: 'En toda la plataforma',
                        color: 'var(--purple ?? #a78bfa)', icon: <ShoppingBag size={18} />,
                    },
                ].map(k => (
                    <div key={k.label} style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '20px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <span style={{ color: k.color, opacity: 0.8 }}>{k.icon}</span>
                        </div>
                        <div style={{
                            fontSize: '24px', fontWeight: 700, marginBottom: '4px',
                            fontFamily: k.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                        }}>
                            {k.value}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>{k.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>{k.sub}</div>
                    </div>
                ))}
            </div>

            {/* Tabla de tenants con más ventas */}
            <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '14px' }}>
                    Negocios registrados
                </div>
                <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    padding: '8px 20px', fontSize: '10px', fontWeight: 600,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.5px', borderBottom: '1px solid var(--border)',
                }}>
                    <span>Negocio</span>
                    <span>Plan</span>
                    <span>Sucursales</span>
                    <span>Estado</span>
                </div>
                {(tenants as any[]).map(t => (
                    <div key={t.id} style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        padding: '12px 20px', fontSize: '13px',
                        borderBottom: '1px solid var(--border)',
                        alignItems: 'center',
                    }}>
                        <div>
                            <div style={{ fontWeight: 500 }}>{t.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {t.slug}
                            </div>
                        </div>
                        <span style={{
                            fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                            borderRadius: '20px', display: 'inline-block',
                            color: t.plan === 'PRO' ? 'var(--accent)' : t.plan === 'ENTERPRISE' ? 'var(--success)' : 'var(--text-secondary)',
                            background: t.plan === 'PRO' ? 'var(--accent-bg)' : t.plan === 'ENTERPRISE' ? 'var(--success-bg)' : 'var(--bg-overlay)',
                        }}>
                            {t.plan}
                        </span>
                        <span>{t.branches?.length ?? t._count?.branches ?? 0}</span>
                        <span style={{
                            fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                            borderRadius: '20px', display: 'inline-block',
                            color: t.active ? 'var(--success)' : 'var(--danger)',
                            background: t.active ? 'var(--success-bg)' : 'var(--danger-bg)',
                        }}>
                            {t.active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}