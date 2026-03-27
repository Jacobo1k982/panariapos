'use client'
import { useState } from 'react'
import {
    Users, Plus, X, Search, CreditCard,
    TrendingUp, AlertCircle, Phone, Calendar,
    Edit2, Trash2, ChevronRight, ArrowUpRight,
    ArrowDownRight, Gift, Clock
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type CustomerStatus = 'active' | 'inactive' | 'blocked'

interface Purchase {
    id: string; date: string; items: string; total: number; payment: string
}
interface CreditTransaction {
    id: string; date: string; type: 'charge' | 'payment'; amount: number; note: string
}
interface Customer {
    id: string; name: string; phone: string; email?: string
    status: CustomerStatus; loyaltyPoints: number
    creditLimit: number; creditBalance: number
    totalSpent: number; visitCount: number
    lastVisit: string; since: string
    purchases: Purchase[]; creditHistory: CreditTransaction[]
    notes?: string
}

// ─── Datos demo ───────────────────────────────────────────────────────────────
const DEMO_CUSTOMERS: Customer[] = [
    {
        id: 'C001', name: 'María Rodríguez', phone: '8888-1234', email: 'maria@gmail.com',
        status: 'active', loyaltyPoints: 850, creditLimit: 15000, creditBalance: 4500,
        totalSpent: 128000, visitCount: 47, lastVisit: '2024-01-15', since: '2023-03-10',
        notes: 'Prefiere pan integral sin sal',
        purchases: [
            { id: 'V001', date: '2024-01-15', items: 'Pan integral x2, Café', total: 3900, payment: 'efectivo' },
            { id: 'V002', date: '2024-01-13', items: 'Croissant x3', total: 2850, payment: 'sinpe' },
            { id: 'V003', date: '2024-01-10', items: 'Torta chocolate', total: 2800, payment: 'fiado' },
        ],
        creditHistory: [
            { id: 'CR001', date: '2024-01-10', type: 'charge',  amount: 2800, note: 'Torta de chocolate' },
            { id: 'CR002', date: '2024-01-12', type: 'payment', amount: 1000, note: 'Abono en efectivo' },
            { id: 'CR003', date: '2024-01-14', type: 'charge',  amount: 2700, note: 'Pedido pan baguette x3' },
        ],
    },
    {
        id: 'C002', name: 'Carlos Méndez', phone: '7777-5678',
        status: 'active', loyaltyPoints: 320, creditLimit: 10000, creditBalance: 0,
        totalSpent: 45000, visitCount: 18, lastVisit: '2024-01-14', since: '2023-08-22',
        purchases: [
            { id: 'V004', date: '2024-01-14', items: 'Empanada x4, Jugo', total: 6200, payment: 'tarjeta' },
            { id: 'V005', date: '2024-01-08', items: 'Pan dulce x6',      total: 3600, payment: 'efectivo' },
        ],
        creditHistory: [],
    },
    {
        id: 'C003', name: 'Ana Jiménez', phone: '6666-9012', email: 'ana.j@hotmail.com',
        status: 'active', loyaltyPoints: 1240, creditLimit: 20000, creditBalance: 12000,
        totalSpent: 210000, visitCount: 89, lastVisit: '2024-01-15', since: '2022-11-05',
        notes: 'Cliente frecuente — descuento 5% en compras mayores a ₡5.000',
        purchases: [
            { id: 'V006', date: '2024-01-15', items: 'Pan masa madre, Muffin x2', total: 5900, payment: 'fiado' },
            { id: 'V007', date: '2024-01-12', items: 'Torta x2',                  total: 5600, payment: 'sinpe' },
        ],
        creditHistory: [
            { id: 'CR004', date: '2024-01-05', type: 'payment', amount: 5000, note: 'Pago saldo anterior' },
            { id: 'CR005', date: '2024-01-10', type: 'charge',  amount: 8000, note: 'Pedido corporativo' },
            { id: 'CR006', date: '2024-01-15', type: 'charge',  amount: 9000, note: 'Pedido semanal' },
        ],
    },
    {
        id: 'C004', name: 'Roberto Solís', phone: '5555-3456',
        status: 'blocked', loyaltyPoints: 90, creditLimit: 5000, creditBalance: 4800,
        totalSpent: 22000, visitCount: 9, lastVisit: '2023-12-20', since: '2023-09-15',
        purchases: [
            { id: 'V008', date: '2023-12-20', items: 'Pan baguette x5', total: 4250, payment: 'fiado' },
        ],
        creditHistory: [
            { id: 'CR007', date: '2023-12-20', type: 'charge',  amount: 4250, note: 'Pan baguette' },
            { id: 'CR008', date: '2023-12-01', type: 'charge',  amount: 3800, note: 'Pedido anterior' },
            { id: 'CR009', date: '2023-12-10', type: 'payment', amount: 3250, note: 'Pago parcial' },
        ],
    },
    {
        id: 'C005', name: 'Lucía Vargas', phone: '4444-7890', email: 'lucia@empresa.cr',
        status: 'active', loyaltyPoints: 2100, creditLimit: 50000, creditBalance: 0,
        totalSpent: 380000, visitCount: 134, lastVisit: '2024-01-15', since: '2022-01-15',
        purchases: [
            { id: 'V009', date: '2024-01-15', items: 'Pedido corporativo semanal', total: 18000, payment: 'transferencia' },
            { id: 'V010', date: '2024-01-08', items: 'Pedido corporativo semanal', total: 18000, payment: 'transferencia' },
        ],
        creditHistory: [],
    },
]

const STATUS_CFG: Record<CustomerStatus, { label: string; color: string; bg: string }> = {
    active:   { label: 'Activo',    color: 'var(--success)',    bg: 'var(--success-bg)' },
    inactive: { label: 'Inactivo',  color: 'var(--text-muted)', bg: 'var(--bg-overlay)' },
    blocked:  { label: 'Bloqueado', color: 'var(--danger)',     bg: 'var(--danger-bg)'  },
}

function initials(name: string) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
const AVATAR_COLORS = ['#f5a623','#34d399','#60a5fa','#a78bfa','#f87171','#fb923c','#38bdf8']
function avatarColor(id: string) {
    return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length]
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CustomersPage() {
    // ✅ CORRECTO — hook dentro del componente
    const { format } = useCurrency()

    const [customers,    setCustomers]    = useState<Customer[]>(DEMO_CUSTOMERS)
    const [search,       setSearch]       = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | CustomerStatus>('all')
    const [selected,     setSelected]     = useState<Customer | null>(null)
    const [showModal,    setShowModal]    = useState(false)
    const [editing,      setEditing]      = useState<Customer | null>(null)
    const [activeTab,    setActiveTab]    = useState<'history' | 'credit'>('history')

    const totalCredit = customers.reduce((a, c) => a + c.creditBalance, 0)
    const totalPoints = customers.reduce((a, c) => a + c.loyaltyPoints, 0)
    const withCredit  = customers.filter(c => c.creditBalance > 0).length

    const filtered = customers.filter(c => {
        const q = search.toLowerCase()
        return (c.name.toLowerCase().includes(q) || c.phone.includes(q)) &&
               (filterStatus === 'all' || c.status === filterStatus)
    })

    const handleSave = (c: Customer) => {
        setCustomers(prev =>
            editing
                ? prev.map(x => x.id === c.id ? c : x)
                : [...prev, { ...c, id: `C${String(Date.now()).slice(-4)}`, purchases: [], creditHistory: [], since: new Date().toISOString().split('T')[0] }]
        )
        setShowModal(false)
        setEditing(null)
    }

    const handleCharge = (customerId: string, amount: number, note: string) => {
        const tx = { id: String(Date.now()), date: new Date().toLocaleDateString('es-CR'), type: 'charge' as const, amount, note }
        setCustomers(prev => prev.map(c => c.id !== customerId ? c : { ...c, creditBalance: c.creditBalance + amount, creditHistory: [...c.creditHistory, tx] }))
        setSelected(prev => prev ? { ...prev, creditBalance: prev.creditBalance + amount, creditHistory: [...prev.creditHistory, tx] } : null)
    }

    const handlePayment = (customerId: string, amount: number, note: string) => {
        const tx = { id: String(Date.now()), date: new Date().toLocaleDateString('es-CR'), type: 'payment' as const, amount, note }
        setCustomers(prev => prev.map(c => c.id !== customerId ? c : { ...c, creditBalance: Math.max(0, c.creditBalance - amount), creditHistory: [...c.creditHistory, tx] }))
        setSelected(prev => prev ? { ...prev, creditBalance: Math.max(0, prev.creditBalance - amount), creditHistory: [...prev.creditHistory, tx] } : null)
    }

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

            {/* Panel izquierdo */}
            <div style={{ width: selected ? '380px' : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: selected ? '1px solid var(--border)' : 'none', transition: 'width 0.2s ease', overflow: 'hidden' }}>

                {/* Stats */}
                <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '10px' }}>
                    {[
                        { label: 'Clientes',      value: customers.length,           color: 'var(--info)',    icon: <Users size={14} /> },
                        { label: 'Fiado total',    value: format(totalCredit),        color: 'var(--warning)', icon: <CreditCard size={14} />, mono: true },
                        { label: 'Con saldo',      value: withCredit,                 color: 'var(--accent)',  icon: <AlertCircle size={14} /> },
                        { label: 'Puntos activos', value: totalPoints.toLocaleString(), color: 'var(--success)', icon: <Gift size={14} /> },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ color: s.color }}>{s.icon}</span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color, fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-sans)' }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div style={{ padding: '14px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
                        <input className="input-base" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre o teléfono..." style={{ width: '100%', padding: '8px 10px 8px 28px', fontSize: '13px' }} />
                    </div>
                    <select className="input-base" value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)} style={{ padding: '8px 10px', fontSize: '13px', cursor: 'pointer' }}>
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="blocked">Bloqueados</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                    <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-accent" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                        <Plus size={14} /> Nuevo
                    </button>
                </div>

                {/* Lista */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filtered.map(c => (
                        <CustomerRow key={c.id} customer={c} isSelected={selected?.id === c.id} format={format} onClick={() => { setSelected(c); setActiveTab('history') }} />
                    ))}
                    {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '13px' }}>Sin resultados</div>}
                </div>
            </div>

            {/* Panel derecho */}
            {selected && (
                <CustomerDetail
                    customer={selected} activeTab={activeTab} format={format}
                    onTabChange={setActiveTab} onClose={() => setSelected(null)}
                    onEdit={() => { setEditing(selected); setShowModal(true) }}
                    onCharge={handleCharge} onPayment={handlePayment}
                />
            )}

            {/* Modal */}
            {showModal && (
                <CustomerModal customer={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null) }} />
            )}
        </div>
    )
}

// ─── CustomerRow ──────────────────────────────────────────────────────────────
// ✅ format se recibe como prop — los sub-componentes NO usan el hook directamente
function CustomerRow({ customer: c, isSelected, onClick, format }: {
    customer: Customer; isSelected: boolean; onClick: () => void; format: (n: number) => string
}) {
    const cfg   = STATUS_CFG[c.status]
    const color = avatarColor(c.id)
    return (
        <div onClick={onClick} style={{ background: isSelected ? 'var(--bg-overlay)' : 'var(--bg-surface)', border: `1px solid ${isSelected ? 'var(--border-hover)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '12px' }}
            onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)' }}
            onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)' }}
        >
            <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: `${color}22`, border: `1.5px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color }}>
                {initials(c.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '20px', color: cfg.color, background: cfg.bg, flexShrink: 0 }}>{cfg.label}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
                    <span><Phone size={10} style={{ display: 'inline', marginRight: 3 }} />{c.phone}</span>
                    <span>🏆 {c.loyaltyPoints} pts</span>
                </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {c.creditBalance > 0 && <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>{format(c.creditBalance)}</div>}
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}><ChevronRight size={12} style={{ display: 'inline' }} /></div>
            </div>
        </div>
    )
}

// ─── CustomerDetail ───────────────────────────────────────────────────────────
function CustomerDetail({ customer: c, activeTab, onTabChange, onClose, onEdit, onCharge, onPayment, format }: {
    customer: Customer; activeTab: 'history' | 'credit'
    onTabChange: (t: 'history' | 'credit') => void
    onClose: () => void; onEdit: () => void
    onCharge: (id: string, amount: number, note: string) => void
    onPayment: (id: string, amount: number, note: string) => void
    format: (n: number) => string
}) {
    const [showCreditForm, setShowCreditForm] = useState(false)
    const [creditType,     setCreditType]     = useState<'charge' | 'payment'>('payment')
    const [amount,         setAmount]         = useState('')
    const [note,           setNote]           = useState('')
    const color     = avatarColor(c.id)
    const cfg       = STATUS_CFG[c.status]
    const creditPct = c.creditLimit > 0 ? Math.min(100, (c.creditBalance / c.creditLimit) * 100) : 0

    const handleCredit = () => {
        const n = parseFloat(amount)
        if (!n || n <= 0) return
        if (creditType === 'charge') onCharge(c.id, n, note || 'Cargo a fiado')
        else onPayment(c.id, n, note || 'Abono')
        setAmount(''); setNote(''); setShowCreditForm(false)
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color, flexShrink: 0 }}>
                        {initials(c.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, fontSize: '16px' }}>{c.name}</span>
                            <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px', color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            <span>📞 {c.phone}</span>
                            {c.email && <span>✉ {c.email}</span>}
                            <span><Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />Desde {c.since}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={onEdit}  className="btn-ghost" style={{ padding: '7px' }}><Edit2 size={14} /></button>
                        <button onClick={onClose} className="btn-ghost" style={{ padding: '7px' }}><X size={14} /></button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: '8px', marginTop: '16px' }}>
                    {[
                        { label: 'Total gastado', value: format(c.totalSpent), color: 'var(--accent)', mono: true },
                        { label: 'Visitas',        value: c.visitCount,         color: 'var(--info)'   },
                        { label: 'Última visita',  value: c.lastVisit,          color: 'var(--text-secondary)' },
                        { label: 'Puntos',         value: `🏆 ${c.loyaltyPoints}`, color: 'var(--success)' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: s.color, fontFamily: s.mono ? 'var(--font-mono)' : 'inherit' }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Fiado */}
                {c.creditLimit > 0 && (
                    <div style={{ marginTop: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Cuenta fiado</span>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Límite: {format(c.creditLimit)}</span>
                                <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: c.creditBalance > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                    {c.creditBalance > 0 ? `Debe: ${format(c.creditBalance)}` : '✓ Al día'}
                                </span>
                            </div>
                        </div>
                        <div style={{ height: 5, background: 'var(--bg-overlay)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 3, width: `${creditPct}%`, background: creditPct > 80 ? 'var(--danger)' : creditPct > 50 ? 'var(--warning)' : 'var(--success)', transition: 'width 0.4s ease' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button onClick={() => { setCreditType('payment'); setShowCreditForm(true) }} style={{ flex: 1, padding: '7px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 500, background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.3)', color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <ArrowDownRight size={13} /> Registrar pago
                            </button>
                            <button onClick={() => { setCreditType('charge'); setShowCreditForm(true) }} style={{ flex: 1, padding: '7px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 500, background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <ArrowUpRight size={13} /> Cargar fiado
                            </button>
                        </div>
                        {showCreditForm && (
                            <div style={{ marginTop: '10px', padding: '12px', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: creditType === 'payment' ? 'var(--success)' : 'var(--danger)' }}>
                                    {creditType === 'payment' ? '↓ Registrar abono' : '↑ Cargar a fiado'}
                                </div>
                                <input type="number" className="input-base" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Monto" style={{ padding: '8px 12px', fontSize: '16px', fontFamily: 'var(--font-mono)', fontWeight: 600 }} />
                                <input className="input-base" value={note} onChange={e => setNote(e.target.value)} placeholder="Descripción (opcional)" style={{ padding: '8px 12px', fontSize: '13px' }} />
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => setShowCreditForm(false)} className="btn-ghost" style={{ flex: 1, padding: '8px', fontSize: '12px' }}>Cancelar</button>
                                    <button onClick={handleCredit} className="btn-accent" disabled={!amount} style={{ flex: 2, padding: '8px', fontSize: '12px', opacity: !amount ? 0.4 : 1 }}>Confirmar</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {c.notes && (
                    <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        📝 {c.notes}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
                {(['history', 'credit'] as const).map(t => (
                    <button key={t} onClick={() => onTabChange(t)} style={{ flex: 1, padding: '12px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === t ? 'var(--accent)' : 'transparent'}`, color: activeTab === t ? 'var(--accent)' : 'var(--text-muted)', transition: 'all 0.15s', fontFamily: 'var(--font-sans)' }}>
                        {t === 'history' ? '🛒 Compras' : '💳 Cuenta fiado'}
                    </button>
                ))}
            </div>

            {/* Contenido */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                {activeTab === 'history' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {c.purchases.length === 0
                            ? <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>Sin compras registradas</div>
                            : c.purchases.map(p => (
                                <div key={p.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{p.items}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
                                            <span><Clock size={10} style={{ display: 'inline', marginRight: 3 }} />{p.date}</span>
                                            <span style={{ background: 'var(--bg-overlay)', padding: '1px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 500, color: 'var(--text-secondary)' }}>{p.payment}</span>
                                        </div>
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--accent)' }}>{format(p.total)}</span>
                                </div>
                            ))
                        }
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {c.creditHistory.length === 0
                            ? <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>Sin movimientos</div>
                            : [...c.creditHistory].reverse().map(tx => (
                                <div key={tx.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '8px', flexShrink: 0, background: tx.type === 'payment' ? 'var(--success-bg)' : 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {tx.type === 'payment' ? <ArrowDownRight size={16} color="var(--success)" /> : <ArrowUpRight size={16} color="var(--danger)" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{tx.note}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{tx.date}</div>
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: tx.type === 'payment' ? 'var(--success)' : 'var(--danger)' }}>
                                        {tx.type === 'payment' ? '−' : '+'} {format(tx.amount)}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── CustomerModal ────────────────────────────────────────────────────────────
function CustomerModal({ customer, onSave, onClose }: {
    customer: Customer | null; onSave: (c: Customer) => void; onClose: () => void
}) {
    const [form, setForm] = useState<Customer>(customer ?? {
        id: '', name: '', phone: '', email: '', status: 'active',
        loyaltyPoints: 0, creditLimit: 0, creditBalance: 0,
        totalSpent: 0, visitCount: 0, lastVisit: '', since: '',
        purchases: [], creditHistory: [], notes: '',
    })
    const set = (k: keyof Customer, v: any) => setForm(f => ({ ...f, [k]: v }))

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card animate-pop" style={{ width: 440, padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{customer ? 'Editar cliente' : 'Nuevo cliente'}</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Nombre completo *</label>
                        <input className="input-base" value={form.name} onChange={e => set('name', e.target.value)} placeholder="María Rodríguez" style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Teléfono *</label>
                            <input className="input-base" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="8888-1234" style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Email</label>
                            <input className="input-base" type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="correo@gmail.com" style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Estado</label>
                            <select className="input-base" value={form.status} onChange={e => set('status', e.target.value)} style={{ width: '100%', padding: '9px 12px', fontSize: '13px', cursor: 'pointer' }}>
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                                <option value="blocked">Bloqueado</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Límite de fiado</label>
                            <input className="input-base" type="number" value={form.creditLimit} onChange={e => set('creditLimit', Number(e.target.value))} placeholder="0 = sin crédito" style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Notas internas</label>
                        <textarea className="input-base" value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Preferencias, observaciones..." rows={2} style={{ width: '100%', padding: '9px 12px', fontSize: '13px', resize: 'vertical' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '11px' }}>Cancelar</button>
                    <button onClick={() => onSave(form)} className="btn-accent" disabled={!form.name || !form.phone} style={{ flex: 2, padding: '11px', opacity: (!form.name || !form.phone) ? 0.4 : 1 }}>
                        {customer ? 'Guardar cambios' : 'Registrar cliente'}
                    </button>
                </div>
            </div>
        </div>
    )
}
