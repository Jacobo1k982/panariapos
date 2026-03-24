'use client'
import { useState } from 'react'
import {
    Truck, Plus, X, Search, Package,
    CreditCard, CheckCircle, Clock, Edit2,
    Trash2, ChevronRight, AlertCircle
} from 'lucide-react'
import {
    useSuppliers, useSupplierOrders, usePayablesSummary,
    useCreateSupplier, useCreatePurchaseOrder, useReceiveOrder
} from '@/hooks/useSuppliers'
import { formatCRC } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface SupplierForm {
    name: string
    phone: string
    email: string
    notes: string
}

interface OrderLine {
    itemName: string
    quantity: number
    unit: string
    cost: number
}

const UNITS = ['KG', 'G', 'L', 'ML', 'UNIT', 'PACK']

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    PENDING: { label: 'Pendiente', color: 'var(--accent)', bg: 'var(--accent-bg)', icon: Clock },
    RECEIVED: { label: 'Recibida', color: 'var(--success)', bg: 'var(--success-bg)', icon: CheckCircle },
    CANCELLED: { label: 'Cancelada', color: 'var(--danger)', bg: 'var(--danger-bg)', icon: X },
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function SuppliersPage() {
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<any>(null)
    const [showSupForm, setShowSupForm] = useState(false)
    const [showOrdForm, setShowOrdForm] = useState(false)
    const [activeTab, setActiveTab] = useState<'suppliers' | 'orders'>('suppliers')

    const { data: suppliers = [], isLoading: loadingSup } = useSuppliers(search || undefined)
    const { data: orders = [], isLoading: loadingOrd } = useSupplierOrders()
    const { data: payables } = usePayablesSummary()
    const createSupplier = useCreateSupplier()
    const createOrder = useCreatePurchaseOrder()
    const receiveOrder = useReceiveOrder()

    const pending = orders.filter((o: any) => o.status === 'PENDING')
    const received = orders.filter((o: any) => o.status === 'RECEIVED')

    const handleReceive = async (id: string) => {
        try {
            await receiveOrder.mutateAsync(id)
            toast.success('Orden marcada como recibida')
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Error al recibir orden')
        }
    }

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
                {[
                    { label: 'Proveedores', value: suppliers.length, color: 'var(--info)', icon: <Truck size={14} /> },
                    { label: 'Órdenes activas', value: pending.length, color: 'var(--accent)', icon: <Clock size={14} /> },
                    { label: 'Recibidas', value: received.length, color: 'var(--success)', icon: <CheckCircle size={14} /> },
                    { label: 'CxP pendiente', value: formatCRC(payables?.totalPayable ?? 0), color: 'var(--warning)', icon: <CreditCard size={14} />, mono: true },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '16px 18px',
                    }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: s.color }}>{s.icon}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                        </div>
                        <div style={{
                            fontSize: '20px', fontWeight: 700, color: s.color,
                            fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                        }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* ── Tabs + toolbar ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{
                    display: 'flex', background: 'var(--bg-surface)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                    padding: '3px', gap: '2px',
                }}>
                    {(['suppliers', 'orders'] as const).map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} style={{
                            padding: '7px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: 500,
                            background: activeTab === t ? 'var(--bg-overlay)' : 'transparent',
                            color: activeTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: activeTab === t ? '1px solid var(--border-hover)' : '1px solid transparent',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                            {t === 'suppliers' ? '🏭 Proveedores' : '📋 Órdenes de compra'}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {activeTab === 'suppliers' && (
                        <div style={{ position: 'relative' }}>
                            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                className="input-base"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar proveedor..."
                                style={{ padding: '8px 10px 8px 28px', fontSize: '13px', width: '200px' }}
                            />
                        </div>
                    )}
                    <button
                        onClick={() => activeTab === 'suppliers' ? setShowSupForm(true) : setShowOrdForm(true)}
                        className="btn-accent"
                        style={{ padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Plus size={14} />
                        {activeTab === 'suppliers' ? 'Nuevo proveedor' : 'Nueva orden'}
                    </button>
                </div>
            </div>

            {/* ── Contenido ── */}
            {activeTab === 'suppliers' ? (
                <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '16px' }}>

                    {/* Lista proveedores */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {loadingSup ? (
                            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                Cargando...
                            </div>
                        ) : suppliers.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '48px',
                                background: 'var(--bg-surface)', border: '1px dashed var(--border)',
                                borderRadius: 'var(--radius-lg)',
                            }}>
                                <Truck size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Sin proveedores</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Agregá tu primer proveedor para comenzar
                                </div>
                            </div>
                        ) : suppliers.map((sup: any) => (
                            <div
                                key={sup.id}
                                onClick={() => setSelected(selected?.id === sup.id ? null : sup)}
                                style={{
                                    background: selected?.id === sup.id ? 'var(--bg-overlay)' : 'var(--bg-surface)',
                                    border: `1px solid ${selected?.id === sup.id ? 'var(--border-hover)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                }}
                                onMouseEnter={e => { if (selected?.id !== sup.id) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)' }}
                                onMouseLeave={e => { if (selected?.id !== sup.id) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)' }}
                            >
                                <div style={{
                                    width: 42, height: 42, borderRadius: '10px', flexShrink: 0,
                                    background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px',
                                }}>
                                    🏭
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{sup.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
                                        {sup.phone && <span>📞 {sup.phone}</span>}
                                        {sup.email && <span>✉ {sup.email}</span>}
                                        <span>📋 {sup._count?.purchaseOrders ?? 0} órdenes</span>
                                    </div>
                                </div>
                                <ChevronRight size={15} color="var(--text-muted)" />
                            </div>
                        ))}
                    </div>

                    {/* Detalle proveedor */}
                    {selected && (
                        <div style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)', padding: '20px',
                            display: 'flex', flexDirection: 'column', gap: '14px',
                            alignSelf: 'start',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{selected.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {selected.phone && <span>📞 {selected.phone}</span>}
                                        {selected.email && <span>✉ {selected.email}</span>}
                                    </div>
                                </div>
                                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <X size={15} />
                                </button>
                            </div>

                            {selected.notes && (
                                <div style={{
                                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                                    background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                                    fontSize: '12px', color: 'var(--text-secondary)',
                                }}>
                                    📝 {selected.notes}
                                </div>
                            )}

                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Historial de órdenes
                            </div>

                            {selected.purchaseOrders?.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    Sin órdenes registradas
                                </div>
                            ) : selected.purchaseOrders?.map((o: any) => {
                                const cfg = STATUS_CFG[o.status] ?? STATUS_CFG.PENDING
                                return (
                                    <div key={o.id} style={{
                                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)', padding: '10px 14px',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>
                                                {o.lines?.length ?? 0} ítem{(o.lines?.length ?? 0) !== 1 ? 's' : ''}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {new Date(o.createdAt).toLocaleDateString('es-CR')}
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                                            color: cfg.color, background: cfg.bg,
                                        }}>{cfg.label}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>
                                            {formatCRC(Number(o.total))}
                                        </span>
                                    </div>
                                )
                            })}

                            <button
                                onClick={() => { setShowOrdForm(true) }}
                                className="btn-ghost"
                                style={{ padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <Plus size={13} /> Nueva orden a este proveedor
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* ── Órdenes de compra ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {loadingOrd ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '13px' }}>Cargando...</div>
                    ) : orders.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '48px',
                            background: 'var(--bg-surface)', border: '1px dashed var(--border)',
                            borderRadius: 'var(--radius-lg)',
                        }}>
                            <Package size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Sin órdenes</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Creá tu primera orden de compra</div>
                        </div>
                    ) : orders.map((order: any) => {
                        const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.PENDING
                        const Icon = cfg.icon
                        return (
                            <div key={order.id} style={{
                                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                                display: 'grid', gridTemplateColumns: 'auto 1fr auto',
                                gap: '14px', alignItems: 'center',
                            }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: '10px',
                                    background: cfg.bg, border: `1px solid ${cfg.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Icon size={18} color={cfg.color} />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                        <span style={{ fontWeight: 600, fontSize: '14px' }}>
                                            {order.supplier?.name}
                                        </span>
                                        <span style={{
                                            fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px',
                                            color: cfg.color, background: cfg.bg,
                                        }}>{cfg.label}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '14px' }}>
                                        <span>📦 {order.lines?.length ?? 0} productos</span>
                                        <span>📅 {new Date(order.createdAt).toLocaleDateString('es-CR')}</span>
                                        {order.notes && <span>📝 {order.notes}</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px', color: 'var(--accent)' }}>
                                        {formatCRC(Number(order.total))}
                                    </span>
                                    {order.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleReceive(order.id)}
                                            disabled={receiveOrder.isPending}
                                            style={{
                                                padding: '7px 14px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 500,
                                                background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.3)',
                                                color: 'var(--success)', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                            }}
                                        >
                                            <CheckCircle size={12} /> Recibir
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Modal nuevo proveedor ── */}
            {showSupForm && (
                <SupplierModal
                    onClose={() => setShowSupForm(false)}
                    onSave={async (data) => {
                        try {
                            await createSupplier.mutateAsync(data)
                            toast.success('Proveedor creado')
                            setShowSupForm(false)
                        } catch (err: any) {
                            toast.error(err.response?.data?.message ?? 'Error al crear proveedor')
                        }
                    }}
                    isLoading={createSupplier.isPending}
                />
            )}

            {/* ── Modal nueva orden ── */}
            {showOrdForm && (
                <OrderModal
                    suppliers={suppliers}
                    defaultSupplierId={selected?.id}
                    onClose={() => setShowOrdForm(false)}
                    onSave={async (data) => {
                        try {
                            await createOrder.mutateAsync(data)
                            toast.success('Orden de compra creada')
                            setShowOrdForm(false)
                        } catch (err: any) {
                            toast.error(err.response?.data?.message ?? 'Error al crear orden')
                        }
                    }}
                    isLoading={createOrder.isPending}
                />
            )}
        </div>
    )
}

// ─── SupplierModal ────────────────────────────────────────────────────────────
function SupplierModal({ onClose, onSave, isLoading }: {
    onClose: () => void
    onSave: (data: SupplierForm) => Promise<void>
    isLoading: boolean
}) {
    const [form, setForm] = useState<SupplierForm>({ name: '', phone: '', email: '', notes: '' })
    const set = (k: keyof SupplierForm, v: string) => setForm(f => ({ ...f, [k]: v }))

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100,
        }}>
            <div className="card animate-pop" style={{ width: 420, padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>Nuevo proveedor</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { key: 'name', label: 'Nombre *', placeholder: 'Molinos CR' },
                        { key: 'phone', label: 'Teléfono', placeholder: '2222-3333' },
                        { key: 'email', label: 'Email', placeholder: 'ventas@molinos.cr' },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                                {f.label}
                            </label>
                            <input
                                className="input-base"
                                value={form[f.key as keyof SupplierForm]}
                                onChange={e => set(f.key as keyof SupplierForm, e.target.value)}
                                placeholder={f.placeholder}
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                            />
                        </div>
                    ))}
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Notas</label>
                        <textarea
                            className="input-base"
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            placeholder="Condiciones, días de entrega..."
                            rows={2}
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '11px' }}>Cancelar</button>
                    <button
                        onClick={() => onSave(form)}
                        className="btn-accent"
                        disabled={!form.name || isLoading}
                        style={{ flex: 2, padding: '11px', opacity: (!form.name || isLoading) ? 0.4 : 1 }}
                    >
                        {isLoading ? 'Guardando...' : 'Crear proveedor'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── OrderModal ───────────────────────────────────────────────────────────────
function OrderModal({ suppliers, defaultSupplierId, onClose, onSave, isLoading }: {
    suppliers: any[]
    defaultSupplierId?: string
    onClose: () => void
    onSave: (data: any) => Promise<void>
    isLoading: boolean
}) {
    const [supplierId, setSupplierId] = useState(defaultSupplierId ?? suppliers[0]?.id ?? '')
    const [lines, setLines] = useState<OrderLine[]>([{ itemName: '', quantity: 1, unit: 'KG', cost: 0 }])
    const [notes, setNotes] = useState('')

    const total = lines.reduce((a, l) => a + (l.quantity * l.cost), 0)

    const addLine = () => setLines(l => [...l, { itemName: '', quantity: 1, unit: 'KG', cost: 0 }])
    const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i))
    const updateLine = (i: number, k: keyof OrderLine, v: string | number) =>
        setLines(l => l.map((line, idx) => idx === i ? { ...line, [k]: v } : line))

    const handleSave = () => {
        onSave({ supplierId, lines, notes })
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100,
        }}>
            <div className="card animate-pop" style={{ width: 540, padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>Nueva orden de compra</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Proveedor */}
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                            Proveedor
                        </label>
                        <select
                            className="input-base"
                            value={supplierId}
                            onChange={e => setSupplierId(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px', cursor: 'pointer' }}
                        >
                            {suppliers.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Líneas */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                Productos a comprar
                            </label>
                            <button onClick={addLine} className="btn-ghost"
                                style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Plus size={11} /> Agregar
                            </button>
                        </div>

                        {/* Header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                            gap: '6px', padding: '4px 0',
                            fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.4px',
                        }}>
                            <span>Producto</span>
                            <span>Cantidad</span>
                            <span>Unidad</span>
                            <span>Costo unit.</span>
                            <span></span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {lines.map((line, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '6px', alignItems: 'center' }}>
                                    <input
                                        className="input-base"
                                        value={line.itemName}
                                        onChange={e => updateLine(i, 'itemName', e.target.value)}
                                        placeholder="Harina de trigo"
                                        style={{ padding: '7px 9px', fontSize: '12px' }}
                                    />
                                    <input
                                        type="number" min="0"
                                        className="input-base"
                                        value={line.quantity || ''}
                                        onChange={e => updateLine(i, 'quantity', Number(e.target.value))}
                                        style={{ padding: '7px 9px', fontSize: '12px' }}
                                    />
                                    <select
                                        className="input-base"
                                        value={line.unit}
                                        onChange={e => updateLine(i, 'unit', e.target.value)}
                                        style={{ padding: '7px 9px', fontSize: '12px', cursor: 'pointer' }}
                                    >
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <input
                                        type="number" min="0"
                                        className="input-base"
                                        value={line.cost || ''}
                                        onChange={e => updateLine(i, 'cost', Number(e.target.value))}
                                        placeholder="₡"
                                        style={{ padding: '7px 9px', fontSize: '12px' }}
                                    />
                                    <button
                                        onClick={() => removeLine(i)}
                                        disabled={lines.length === 1}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--text-muted)', padding: '4px',
                                            opacity: lines.length === 1 ? 0.3 : 1,
                                        }}
                                        onMouseEnter={e => { if (lines.length > 1) (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)' }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div style={{
                        background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                        borderRadius: 'var(--radius-md)', padding: '12px 14px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total estimado</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px', color: 'var(--accent)' }}>
                            {formatCRC(total)}
                        </span>
                    </div>

                    {/* Notas */}
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                            Notas (opcional)
                        </label>
                        <input
                            className="input-base"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Instrucciones de entrega..."
                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '11px' }}>Cancelar</button>
                    <button
                        onClick={handleSave}
                        className="btn-accent"
                        disabled={!supplierId || lines.some(l => !l.itemName) || isLoading}
                        style={{
                            flex: 2, padding: '11px',
                            opacity: (!supplierId || lines.some(l => !l.itemName) || isLoading) ? 0.4 : 1
                        }}
                    >
                        {isLoading ? 'Creando...' : 'Crear orden de compra'}
                    </button>
                </div>
            </div>
        </div>
    )
}