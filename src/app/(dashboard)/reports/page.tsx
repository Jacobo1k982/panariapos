'use client'
import { useState, useMemo } from 'react'
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingBag,
    Users, Package, Calendar, Download, ChevronDown
} from 'lucide-react'
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatCRC } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Range = '7d' | '30d' | '90d' | 'month'

// ─── Datos demo ───────────────────────────────────────────────────────────────
const DAILY_SALES = [
    { date: 'Lun 8', sales: 42500, orders: 28, customers: 22 },
    { date: 'Mar 9', sales: 38200, orders: 24, customers: 19 },
    { date: 'Mié 10', sales: 51800, orders: 35, customers: 28 },
    { date: 'Jue 11', sales: 47300, orders: 31, customers: 25 },
    { date: 'Vie 12', sales: 68900, orders: 46, customers: 38 },
    { date: 'Sáb 13', sales: 89400, orders: 61, customers: 50 },
    { date: 'Dom 14', sales: 72100, orders: 49, customers: 41 },
    { date: 'Lun 15', sales: 45600, orders: 30, customers: 24 },
]

const MONTHLY_SALES = Array.from({ length: 12 }, (_, i) => ({
    month: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
    sales: Math.round(800000 + Math.random() * 600000),
    cost: Math.round(400000 + Math.random() * 200000),
}))

const TOP_PRODUCTS = [
    { name: 'Pan baguette', sold: 342, revenue: 290700, cost: 143640, category: 'pan' },
    { name: 'Café americano', sold: 289, revenue: 433500, cost: 86700, category: 'bebidas' },
    { name: 'Croissant', sold: 201, revenue: 190950, cost: 76380, category: 'repostería' },
    { name: 'Pan integral', sold: 187, revenue: 224400, cost: 108460, category: 'pan' },
    { name: 'Cappuccino', sold: 154, revenue: 338800, cost: 61600, category: 'bebidas' },
    { name: 'Torta chocolate', sold: 98, revenue: 274400, cost: 117600, category: 'repostería' },
    { name: 'Pan dulce', sold: 276, revenue: 165600, cost: 66240, category: 'pan' },
    { name: 'Muffin arándanos', sold: 143, revenue: 171600, cost: 68640, category: 'repostería' },
]

const BY_CATEGORY = [
    { name: 'Pan', value: 38, color: '#f5a623' },
    { name: 'Repostería', value: 29, color: '#60a5fa' },
    { name: 'Bebidas', value: 27, color: '#34d399' },
    { name: 'Otros', value: 6, color: '#8b93a8' },
]

const PAYMENT_METHODS = [
    { method: 'Efectivo', count: 312, total: 845000 },
    { method: 'SINPE Móvil', count: 198, total: 623000 },
    { method: 'Tarjeta', count: 87, total: 412000 },
    { method: 'Transferencia', count: 43, total: 318000 },
    { method: 'Fiado', count: 28, total: 142000 },
]

const HOURLY = [
    { hour: '6am', sales: 12 }, { hour: '7am', sales: 28 },
    { hour: '8am', sales: 45 }, { hour: '9am', sales: 38 },
    { hour: '10am', sales: 31 }, { hour: '11am', sales: 29 },
    { hour: '12pm', sales: 52 }, { hour: '1pm', sales: 41 },
    { hour: '2pm', sales: 22 }, { hour: '3pm', sales: 18 },
    { hour: '4pm', sales: 25 }, { hour: '5pm', sales: 33 },
    { hour: '6pm', sales: 29 }, { hour: '7pm', sales: 14 },
]

// ─── Colores del tema ─────────────────────────────────────────────────────────
const C = {
    accent: '#f5a623',
    blue: '#60a5fa',
    green: '#34d399',
    danger: '#f87171',
    purple: '#a78bfa',
    grid: 'rgba(255,255,255,0.05)',
    text: '#8b93a8',
}

// ─── Tooltip custom ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: { name: string; value: number; color: string }[]
    label?: string
}) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: '#1e2333', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', padding: '10px 14px', fontSize: '12px',
        }}>
            <div style={{ color: '#8b93a8', marginBottom: '6px', fontWeight: 500 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontWeight: 600, display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    <span>{p.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {typeof p.value === 'number' && p.name?.toLowerCase().includes('venta')
                            ? formatCRC(p.value) : p.value}
                    </span>
                </div>
            ))}
        </div>
    )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ReportsPage() {
    const [range, setRange] = useState<Range>('7d')

    const data = DAILY_SALES
    const totals = useMemo(() => ({
        revenue: data.reduce((a, d) => a + d.sales, 0),
        orders: data.reduce((a, d) => a + d.orders, 0),
        customers: data.reduce((a, d) => a + d.customers, 0),
        avgTicket: Math.round(data.reduce((a, d) => a + d.sales, 0) / data.reduce((a, d) => a + d.orders, 0)),
    }), [data])

    const topProduct = TOP_PRODUCTS[0]
    const totalRevenue = TOP_PRODUCTS.reduce((a, p) => a + p.revenue, 0)

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>

            {/* ── Header con rango ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2px' }}>Reportes y analítica</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sucursal Central · Enero 2024</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                        display: 'flex', background: 'var(--bg-surface)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '3px', gap: '2px',
                    }}>
                        {(['7d', '30d', '90d', 'month'] as Range[]).map(r => (
                            <button key={r} onClick={() => setRange(r)} style={{
                                padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                                background: range === r ? 'var(--bg-overlay)' : 'transparent',
                                color: range === r ? 'var(--text-primary)' : 'var(--text-muted)',
                                border: range === r ? '1px solid var(--border-hover)' : '1px solid transparent',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}>
                                {r === '7d' ? '7 días' : r === '30d' ? '30 días' : r === '90d' ? '90 días' : 'Este mes'}
                            </button>
                        ))}
                    </div>
                    <button className="btn-ghost" style={{
                        padding: '7px 14px', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        <Download size={14} /> Exportar
                    </button>
                </div>
            </div>

            {/* ── KPI cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
                {[
                    {
                        label: 'Ingresos totales', value: formatCRC(totals.revenue),
                        sub: '+12.4% vs semana anterior', up: true,
                        icon: <DollarSign size={16} />, color: C.accent, mono: true,
                    },
                    {
                        label: 'Órdenes', value: String(totals.orders),
                        sub: '+8.1% vs semana anterior', up: true,
                        icon: <ShoppingBag size={16} />, color: C.blue,
                    },
                    {
                        label: 'Clientes únicos', value: String(totals.customers),
                        sub: '+5.3% vs semana anterior', up: true,
                        icon: <Users size={16} />, color: C.green,
                    },
                    {
                        label: 'Ticket promedio', value: formatCRC(totals.avgTicket),
                        sub: '-2.1% vs semana anterior', up: false,
                        icon: <Package size={16} />, color: C.purple, mono: true,
                    },
                ].map(k => (
                    <KPICard key={k.label} {...k} />
                ))}
            </div>

            {/* ── Ventas diarias + distribución horaria ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

                {/* Ventas diarias */}
                <ChartCard title="Ventas diarias" subtitle="Ingresos y órdenes por día">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
                            <XAxis dataKey="date" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false}
                                tickFormatter={v => `₡${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="sales" name="Ventas" stroke={C.accent}
                                strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: C.accent }} />
                            <Line type="monotone" dataKey="orders" name="Órdenes" stroke={C.blue}
                                strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Pico de ventas por hora */}
                <ChartCard title="Ventas por hora" subtitle="Volumen de órdenes">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={HOURLY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                            <XAxis dataKey="hour" tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="sales" name="Órdenes" fill={C.accent} radius={[3, 3, 0, 0]}
                                opacity={0.85} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ── Productos top + categorías ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

                {/* Top productos */}
                <ChartCard title="Productos más vendidos" subtitle="Por unidades vendidas y margen">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                        {TOP_PRODUCTS.slice(0, 6).map((p, i) => {
                            const margin = Math.round(((p.revenue - p.cost) / p.revenue) * 100)
                            const barW = Math.round((p.sold / TOP_PRODUCTS[0].sold) * 100)
                            return (
                                <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '18px 1fr 80px 56px', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                        {i + 1}
                                    </span>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 500 }}>{p.name}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                                {p.sold} uds
                                            </span>
                                        </div>
                                        <div style={{ height: 4, background: 'var(--bg-overlay)', borderRadius: 2 }}>
                                            <div style={{
                                                height: '100%', borderRadius: 2,
                                                width: `${barW}%`,
                                                background: i === 0 ? C.accent : i === 1 ? C.blue : C.green,
                                                opacity: 1 - i * 0.1,
                                            }} />
                                        </div>
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                        {formatCRC(p.revenue)}
                                    </span>
                                    <span style={{
                                        fontSize: '11px', fontWeight: 600, textAlign: 'right',
                                        color: margin > 50 ? C.green : margin > 30 ? C.accent : C.danger,
                                    }}>
                                        {margin}%
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </ChartCard>

                {/* Por categoría */}
                <ChartCard title="Por categoría" subtitle="% del total de ventas">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={BY_CATEGORY} cx="50%" cy="50%"
                                    innerRadius={48} outerRadius={72}
                                    paddingAngle={3} dataKey="value"
                                >
                                    {BY_CATEGORY.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number) => [`${v}%`, '']}
                                    contentStyle={{ background: '#1e2333', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                            {BY_CATEGORY.map(c => (
                                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{c.name}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* ── Ventas mensuales ── */}
            <ChartCard title="Ingresos vs costo — 2024" subtitle="Comparativa mensual de margen bruto">
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={MONTHLY_SALES} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false}
                            tickFormatter={v => `₡${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="sales" name="Ingresos" fill={C.accent} radius={[3, 3, 0, 0]} opacity={0.9} />
                        <Bar dataKey="cost" name="Costos" fill={C.blue} radius={[3, 3, 0, 0]} opacity={0.6} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* ── Métodos de pago ── */}
            <ChartCard title="Métodos de pago" subtitle="Distribución por cantidad de transacciones y monto">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    {PAYMENT_METHODS.map(pm => {
                        const maxCount = Math.max(...PAYMENT_METHODS.map(p => p.count))
                        const barW = Math.round((pm.count / maxCount) * 100)
                        const COLORS: Record<string, string> = {
                            'Efectivo': '#f5a623', 'SINPE Móvil': '#34d399',
                            'Tarjeta': '#60a5fa', 'Transferencia': '#a78bfa', 'Fiado': '#f87171',
                        }
                        const color = COLORS[pm.method] ?? C.accent
                        return (
                            <div key={pm.method} style={{
                                display: 'grid', gridTemplateColumns: '120px 1fr 80px 100px',
                                gap: '12px', alignItems: 'center',
                            }}>
                                <span style={{ fontSize: '12px', fontWeight: 500 }}>{pm.method}</span>
                                <div style={{ height: 6, background: 'var(--bg-overlay)', borderRadius: 3 }}>
                                    <div style={{
                                        height: '100%', borderRadius: 3,
                                        width: `${barW}%`, background: color, opacity: 0.8,
                                    }} />
                                </div>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    {pm.count} trx
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>
                                    {formatCRC(pm.total)}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </ChartCard>

            {/* ── Resumen rápido ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                <SummaryCard
                    title="Mejor día de la semana"
                    value="Sábado"
                    sub={`Promedio ${formatCRC(89400)} en ventas`}
                    icon="📅"
                />
                <SummaryCard
                    title="Hora pico"
                    value="8:00 – 9:00 am"
                    sub="45 órdenes promedio en ese rango"
                    icon="⏰"
                />
                <SummaryCard
                    title="Producto estrella"
                    value={topProduct.name}
                    sub={`${topProduct.sold} uds · ${formatCRC(topProduct.revenue)} en ingresos`}
                    icon="⭐"
                />
            </div>

        </div>
    )
}

// ─── ChartCard ────────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }: {
    title: string
    subtitle: string
    children: React.ReactNode
}) {
    return (
        <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px',
        }}>
            <div style={{ marginBottom: '14px' }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>
            </div>
            {children}
        </div>
    )
}

// ─── KPICard ──────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, up, icon, color, mono }: {
    label: string; value: string; sub: string; up: boolean
    icon: React.ReactNode; color: string; mono?: boolean
}) {
    return (
        <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ color, opacity: 0.8 }}>{icon}</span>
                <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                    color: up ? C.green : C.danger,
                    background: up ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                    display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                    {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {sub.split(' ')[0]}
                </span>
            </div>
            <div style={{
                fontSize: '22px', fontWeight: 700, marginBottom: '4px',
                fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
                letterSpacing: mono ? '-0.5px' : '0',
            }}>
                {value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
        </div>
    )
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────
function SummaryCard({ title, value, sub, icon }: {
    title: string; value: string; sub: string; icon: string
}) {
    return (
        <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px 18px',
            display: 'flex', gap: '14px', alignItems: 'flex-start',
        }}>
            <div style={{
                width: 40, height: 40, borderRadius: '10px',
                background: 'var(--bg-overlay)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>{value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{sub}</div>
            </div>
        </div>
    )
}