'use client'
import { useState } from 'react'
import {
    Package, AlertTriangle, TrendingDown, Plus,
    Search, Filter, ArrowUpDown, X, Edit2, Trash2
} from 'lucide-react'
import { formatCRC } from '@/lib/utils'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type Unit = 'kg' | 'g' | 'l' | 'ml' | 'unit' | 'pack'
type Category = 'materia_prima' | 'producto_terminado' | 'insumo'

interface InventoryItem {
    id: string
    name: string
    sku: string
    category: Category
    unit: Unit
    quantity: number
    minStock: number
    costPerUnit: number
    supplier?: string
    expiryDate?: string
    lastUpdated: string
}

// ─── Datos demo ───────────────────────────────────────────────────────────────
const DEMO_ITEMS: InventoryItem[] = [
    { id: '1', name: 'Harina de trigo', sku: 'MP001', category: 'materia_prima', unit: 'kg', quantity: 45, minStock: 20, costPerUnit: 850, supplier: 'Molinos CR', lastUpdated: '2024-01-15' },
    { id: '2', name: 'Azúcar blanca', sku: 'MP002', category: 'materia_prima', unit: 'kg', quantity: 12, minStock: 15, costPerUnit: 680, supplier: 'LAICA', lastUpdated: '2024-01-14', expiryDate: '2024-12-01' },
    { id: '3', name: 'Levadura seca', sku: 'MP003', category: 'materia_prima', unit: 'g', quantity: 800, minStock: 500, costPerUnit: 12, supplier: 'Fleischmann', lastUpdated: '2024-01-13', expiryDate: '2024-06-15' },
    { id: '4', name: 'Mantequilla', sku: 'MP004', category: 'materia_prima', unit: 'kg', quantity: 8, minStock: 10, costPerUnit: 3200, supplier: 'Dos Pinos', lastUpdated: '2024-01-15', expiryDate: '2024-02-01' },
    { id: '5', name: 'Huevos', sku: 'MP005', category: 'materia_prima', unit: 'unit', quantity: 144, minStock: 60, costPerUnit: 180, supplier: 'Granja El Sol', lastUpdated: '2024-01-15', expiryDate: '2024-01-28' },
    { id: '6', name: 'Leche entera', sku: 'MP006', category: 'materia_prima', unit: 'l', quantity: 5, minStock: 10, costPerUnit: 750, supplier: 'Dos Pinos', lastUpdated: '2024-01-15', expiryDate: '2024-01-20' },
    { id: '7', name: 'Pan baguette', sku: 'PT001', category: 'producto_terminado', unit: 'unit', quantity: 40, minStock: 10, costPerUnit: 420, lastUpdated: '2024-01-15' },
    { id: '8', name: 'Pan integral', sku: 'PT002', category: 'producto_terminado', unit: 'unit', quantity: 25, minStock: 8, costPerUnit: 580, lastUpdated: '2024-01-15' },
    { id: '9', name: 'Croissant', sku: 'PT003', category: 'producto_terminado', unit: 'unit', quantity: 3, minStock: 10, costPerUnit: 380, lastUpdated: '2024-01-15' },
    { id: '10', name: 'Cajas de empaque', sku: 'IN001', category: 'insumo', unit: 'unit', quantity: 200, minStock: 50, costPerUnit: 120, lastUpdated: '2024-01-10' },
    { id: '11', name: 'Sal', sku: 'MP007', category: 'materia_prima', unit: 'kg', quantity: 6, minStock: 3, costPerUnit: 380, lastUpdated: '2024-01-12' },
    { id: '12', name: 'Aceite vegetal', sku: 'MP008', category: 'materia_prima', unit: 'l', quantity: 4, minStock: 5, costPerUnit: 1200, lastUpdated: '2024-01-11' },
]

const CATEGORY_LABEL: Record<Category, string> = {
    materia_prima: 'Materia prima',
    producto_terminado: 'Producto terminado',
    insumo: 'Insumo',
}

const CATEGORY_COLOR: Record<Category, string> = {
    materia_prima: 'var(--info)',
    producto_terminado: 'var(--accent)',
    insumo: 'var(--text-secondary)',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stockStatus(item: InventoryItem): 'critical' | 'low' | 'ok' {
    if (item.quantity === 0) return 'critical'
    if (item.quantity <= item.minStock) return 'low'
    return 'ok'
}

function daysUntilExpiry(date?: string): number | null {
    if (!date) return null
    return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>(DEMO_ITEMS)
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState<'all' | Category>('all')
    const [filterAlert, setFilterAlert] = useState(false)
    const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'cost'>('name')
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<InventoryItem | null>(null)
    const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)

    const alerts = items.filter(i => stockStatus(i) !== 'ok')
    const expiring = items.filter(i => { const d = daysUntilExpiry(i.expiryDate); return d !== null && d <= 7 })

    const filtered = items
        .filter(i => {
            const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
                i.sku.toLowerCase().includes(search.toLowerCase())
            const matchCat = filterCat === 'all' || i.category === filterCat
            const matchAlert = !filterAlert || stockStatus(i) !== 'ok'
            return matchSearch && matchCat && matchAlert
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'quantity') return a.quantity - b.quantity
            if (sortBy === 'cost') return b.costPerUnit - a.costPerUnit
            return 0
        })

    const totalValue = items.reduce((acc, i) => acc + i.quantity * i.costPerUnit, 0)

    const handleSave = (item: InventoryItem) => {
        setItems(prev =>
            editing
                ? prev.map(i => i.id === item.id ? item : i)
                : [...prev, { ...item, id: String(Date.now()), lastUpdated: new Date().toISOString().split('T')[0] }]
        )
        setShowModal(false)
        setEditing(null)
    }

    const handleDelete = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    const handleAdjust = (id: string, delta: number) => {
        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta), lastUpdated: new Date().toISOString().split('T')[0] } : i
        ))
        setAdjustItem(null)
    }

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflow: 'auto' }}>

            {/* ── Stat cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <StatCard
                    label="Total ítems"
                    value={String(items.length)}
                    icon={<Package size={16} />}
                    color="var(--info)"
                />
                <StatCard
                    label="Valor inventario"
                    value={formatCRC(totalValue)}
                    icon={<Package size={16} />}
                    color="var(--accent)"
                    mono
                />
                <StatCard
                    label="Alertas stock"
                    value={String(alerts.length)}
                    icon={<AlertTriangle size={16} />}
                    color={alerts.length > 0 ? 'var(--danger)' : 'var(--success)'}
                    highlight={alerts.length > 0}
                />
                <StatCard
                    label="Por vencer (7d)"
                    value={String(expiring.length)}
                    icon={<TrendingDown size={16} />}
                    color={expiring.length > 0 ? 'var(--warning)' : 'var(--success)'}
                    highlight={expiring.length > 0}
                />
            </div>

            {/* ── Alertas banner ── */}
            {(alerts.length > 0 || expiring.length > 0) && (
                <div style={{
                    background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 'var(--radius-lg)', padding: '14px 18px',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <AlertTriangle size={14} color="var(--danger)" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>
                            Alertas que requieren atención
                        </span>
                    </div>
                    {alerts.map(i => (
                        <div key={i.id} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                            <span style={{
                                color: stockStatus(i) === 'critical' ? 'var(--danger)' : 'var(--warning)',
                                fontWeight: 600, minWidth: '60px',
                            }}>
                                {stockStatus(i) === 'critical' ? '● Sin stock' : '● Stock bajo'}
                            </span>
                            <span>{i.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                                {i.quantity} {i.unit} / mín. {i.minStock} {i.unit}
                            </span>
                        </div>
                    ))}
                    {expiring.map(i => {
                        const days = daysUntilExpiry(i.expiryDate)!
                        return (
                            <div key={`exp-${i.id}`} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                                <span style={{ color: 'var(--warning)', fontWeight: 600, minWidth: '60px' }}>● Vence pronto</span>
                                <span>{i.name}</span>
                                <span style={{ color: 'var(--text-muted)' }}>
                                    {days <= 0 ? 'Vencido' : `en ${days} día${days !== 1 ? 's' : ''}`}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Toolbar ── */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        className="input-base"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o SKU..."
                        style={{ width: '100%', padding: '9px 10px 9px 32px', fontSize: '13px' }}
                    />
                </div>

                {/* Category filter */}
                <select
                    className="input-base"
                    value={filterCat}
                    onChange={e => setFilterCat(e.target.value as typeof filterCat)}
                    style={{ padding: '9px 12px', fontSize: '13px', cursor: 'pointer' }}
                >
                    <option value="all">Todas las categorías</option>
                    <option value="materia_prima">Materia prima</option>
                    <option value="producto_terminado">Producto terminado</option>
                    <option value="insumo">Insumo</option>
                </select>

                {/* Alert filter */}
                <button
                    onClick={() => setFilterAlert(v => !v)}
                    style={{
                        padding: '9px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px',
                        background: filterAlert ? 'var(--danger-bg)' : 'var(--bg-overlay)',
                        border: `1px solid ${filterAlert ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`,
                        color: filterAlert ? 'var(--danger)' : 'var(--text-secondary)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                >
                    <AlertTriangle size={13} />
                    Solo alertas
                </button>

                {/* Sort */}
                <button
                    onClick={() => setSortBy(s => s === 'name' ? 'quantity' : s === 'quantity' ? 'cost' : 'name')}
                    className="btn-ghost"
                    style={{ padding: '9px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <ArrowUpDown size={13} />
                    {sortBy === 'name' ? 'Nombre' : sortBy === 'quantity' ? 'Cantidad' : 'Costo'}
                </button>

                {/* Add button */}
                <button
                    onClick={() => { setEditing(null); setShowModal(true) }}
                    className="btn-accent"
                    style={{ padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <Plus size={15} />
                    Agregar ítem
                </button>
            </div>

            {/* ── Tabla ── */}
            <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}>
                {/* Table header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 120px',
                    padding: '10px 20px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '11px', fontWeight: 600,
                    color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                    <span>Producto</span>
                    <span>Categoría</span>
                    <span>Cantidad</span>
                    <span>Mín. stock</span>
                    <span>Costo unit.</span>
                    <span>Vencimiento</span>
                    <span style={{ textAlign: 'right' }}>Acciones</span>
                </div>

                {/* Rows */}
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    {filtered.map(item => (
                        <InventoryRow
                            key={item.id}
                            item={item}
                            onEdit={() => { setEditing(item); setShowModal(true) }}
                            onDelete={() => handleDelete(item.id)}
                            onAdjust={() => setAdjustItem(item)}
                        />
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                            Sin resultados
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal ajuste rápido ── */}
            {adjustItem && (
                <AdjustModal
                    item={adjustItem}
                    onConfirm={handleAdjust}
                    onClose={() => setAdjustItem(null)}
                />
            )}

            {/* ── Modal agregar/editar ── */}
            {showModal && (
                <ItemModal
                    item={editing}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditing(null) }}
                />
            )}
        </div>
    )
}

// ─── InventoryRow ─────────────────────────────────────────────────────────────
function InventoryRow({
    item, onEdit, onDelete, onAdjust
}: {
    item: InventoryItem
    onEdit: () => void
    onDelete: () => void
    onAdjust: () => void
}) {
    const status = stockStatus(item)
    const days = daysUntilExpiry(item.expiryDate)

    const statusColor = status === 'critical' ? 'var(--danger)' : status === 'low' ? 'var(--warning)' : 'var(--success)'

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 120px',
                padding: '13px 20px',
                borderBottom: '1px solid var(--border)',
                alignItems: 'center',
                fontSize: '13px',
                transition: 'background 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
        >
            {/* Nombre */}
            <div>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.sku}</div>
            </div>

            {/* Categoría */}
            <span style={{
                fontSize: '11px', fontWeight: 500,
                color: CATEGORY_COLOR[item.category],
                background: `${CATEGORY_COLOR[item.category]}18`,
                padding: '3px 8px', borderRadius: '20px',
                display: 'inline-block',
            }}>
                {CATEGORY_LABEL[item.category]}
            </span>

            {/* Cantidad */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: statusColor, flexShrink: 0,
                }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: status !== 'ok' ? statusColor : 'var(--text-primary)' }}>
                    {item.quantity} {item.unit}
                </span>
            </div>

            {/* Mínimo */}
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {item.minStock} {item.unit}
            </span>

            {/* Costo */}
            <span style={{ fontFamily: 'var(--font-mono)' }}>
                {formatCRC(item.costPerUnit)}
            </span>

            {/* Vencimiento */}
            <div>
                {days !== null ? (
                    <span style={{
                        fontSize: '11px', fontWeight: 500,
                        color: days <= 0 ? 'var(--danger)' : days <= 7 ? 'var(--warning)' : 'var(--text-secondary)',
                    }}>
                        {days <= 0 ? '⚠ Vencido' : days <= 7 ? `⚠ ${days}d` : item.expiryDate}
                    </span>
                ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>—</span>
                )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                <button
                    onClick={onAdjust}
                    title="Ajustar cantidad"
                    style={{
                        background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                        borderRadius: '6px', padding: '5px 8px', cursor: 'pointer',
                        color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600,
                    }}
                >
                    ±
                </button>
                <button
                    onClick={onEdit}
                    style={{
                        background: 'none', border: '1px solid var(--border)',
                        borderRadius: '6px', padding: '5px', cursor: 'pointer',
                        color: 'var(--text-muted)',
                    }}
                >
                    <Edit2 size={12} />
                </button>
                <button
                    onClick={onDelete}
                    style={{
                        background: 'none', border: '1px solid transparent',
                        borderRadius: '6px', padding: '5px', cursor: 'pointer',
                        color: 'var(--text-muted)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
    label, value, icon, color, mono, highlight
}: {
    label: string; value: string; icon: React.ReactNode
    color: string; mono?: boolean; highlight?: boolean
}) {
    return (
        <div style={{
            background: highlight ? `${color}0d` : 'var(--bg-surface)',
            border: `1px solid ${highlight ? `${color}30` : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)', padding: '16px 18px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ color }}>{icon}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{
                fontSize: '20px', fontWeight: 700,
                color: highlight ? color : 'var(--text-primary)',
                fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
                letterSpacing: mono ? '-0.5px' : '0',
            }}>
                {value}
            </div>
        </div>
    )
}

// ─── AdjustModal ──────────────────────────────────────────────────────────────
function AdjustModal({
    item, onConfirm, onClose
}: {
    item: InventoryItem
    onConfirm: (id: string, delta: number) => void
    onClose: () => void
}) {
    const [delta, setDelta] = useState(0)
    const [reason, setReason] = useState('')
    const newQty = Math.max(0, item.quantity + delta)

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100,
        }}>
            <div className="card animate-pop" style={{ width: 380, padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>Ajuste de inventario</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.name}</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Current vs new */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center', gap: '12px',
                    background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)',
                    padding: '14px', marginBottom: '16px',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Actual</div>
                        <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{item.quantity}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.unit}</div>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '20px' }}>→</div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Nuevo</div>
                        <div style={{
                            fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                            color: newQty < item.minStock ? 'var(--warning)' : 'var(--success)',
                        }}>{newQty}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.unit}</div>
                    </div>
                </div>

                {/* Delta input */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                        Cantidad a ajustar (positivo = entrada, negativo = salida)
                    </label>
                    <input
                        type="number"
                        value={delta || ''}
                        onChange={e => setDelta(Number(e.target.value))}
                        className="input-base"
                        placeholder="Ej: 10 ó -5"
                        style={{ width: '100%', padding: '10px 14px', fontSize: '18px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                    />
                </div>

                {/* Quick buttons */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                    {[-10, -5, -1, 1, 5, 10, 20, 50].map(v => (
                        <button
                            key={v}
                            onClick={() => setDelta(v)}
                            className="btn-ghost"
                            style={{
                                flex: 1, padding: '5px', fontSize: '11px',
                                fontFamily: 'var(--font-mono)', fontWeight: 500,
                                color: v < 0 ? 'var(--danger)' : 'var(--success)',
                                borderColor: v < 0 ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)',
                            }}
                        >
                            {v > 0 ? `+${v}` : v}
                        </button>
                    ))}
                </div>

                {/* Reason */}
                <div style={{ marginBottom: '18px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                        Motivo (opcional)
                    </label>
                    <input
                        className="input-base"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Ej: Compra a proveedor, merma, inventario físico..."
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '11px' }}>
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(item.id, delta)}
                        className="btn-accent"
                        disabled={delta === 0}
                        style={{ flex: 2, padding: '11px', opacity: delta === 0 ? 0.4 : 1 }}
                    >
                        Confirmar ajuste
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── ItemModal ────────────────────────────────────────────────────────────────
function ItemModal({
    item, onSave, onClose
}: {
    item: InventoryItem | null
    onSave: (item: InventoryItem) => void
    onClose: () => void
}) {
    const [form, setForm] = useState<InventoryItem>(item ?? {
        id: '', name: '', sku: '', category: 'materia_prima',
        unit: 'kg', quantity: 0, minStock: 0, costPerUnit: 0,
        supplier: '', expiryDate: '', lastUpdated: '',
    })

    const set = (k: keyof InventoryItem, v: string | number) =>
        setForm(f => ({ ...f, [k]: v }))

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100,
        }}>
            <div className="card animate-pop" style={{ width: 460, padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>
                        {item ? 'Editar ítem' : 'Nuevo ítem de inventario'}
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Nombre y SKU */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                        <Field label="Nombre">
                            <input className="input-base" value={form.name} onChange={e => set('name', e.target.value)}
                                placeholder="Harina de trigo" style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </Field>
                        <Field label="SKU">
                            <input className="input-base" value={form.sku} onChange={e => set('sku', e.target.value)}
                                placeholder="MP001" style={{ width: '100%', padding: '9px 12px', fontSize: '13px', fontFamily: 'var(--font-mono)' }} />
                        </Field>
                    </div>

                    {/* Categoría y unidad */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <Field label="Categoría">
                            <select className="input-base" value={form.category} onChange={e => set('category', e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', cursor: 'pointer' }}>
                                <option value="materia_prima">Materia prima</option>
                                <option value="producto_terminado">Producto terminado</option>
                                <option value="insumo">Insumo</option>
                            </select>
                        </Field>
                        <Field label="Unidad">
                            <select className="input-base" value={form.unit} onChange={e => set('unit', e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', cursor: 'pointer' }}>
                                {(['kg', 'g', 'l', 'ml', 'unit', 'pack'] as Unit[]).map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Cantidades */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <Field label="Cantidad actual">
                            <input className="input-base" type="number" value={form.quantity} onChange={e => set('quantity', Number(e.target.value))}
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </Field>
                        <Field label="Stock mínimo">
                            <input className="input-base" type="number" value={form.minStock} onChange={e => set('minStock', Number(e.target.value))}
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </Field>
                        <Field label="Costo por unidad (₡)">
                            <input className="input-base" type="number" value={form.costPerUnit} onChange={e => set('costPerUnit', Number(e.target.value))}
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </Field>
                    </div>

                    {/* Proveedor y vencimiento */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <Field label="Proveedor (opcional)">
                            <input className="input-base" value={form.supplier ?? ''} onChange={e => set('supplier', e.target.value)}
                                placeholder="Nombre del proveedor" style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </Field>
                        <Field label="Fecha vencimiento (opcional)">
                            <input className="input-base" type="date" value={form.expiryDate ?? ''} onChange={e => set('expiryDate', e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }} />
                        </Field>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '11px' }}>Cancelar</button>
                    <button
                        onClick={() => onSave(form)}
                        className="btn-accent"
                        disabled={!form.name || !form.sku}
                        style={{ flex: 2, padding: '11px', opacity: (!form.name || !form.sku) ? 0.4 : 1 }}
                    >
                        {item ? 'Guardar cambios' : 'Agregar al inventario'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                {label}
            </label>
            {children}
        </div>
    )
}