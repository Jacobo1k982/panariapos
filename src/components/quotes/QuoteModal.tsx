'use client'
import { useState, FormEvent } from 'react'
import {
    X, Plus, Trash2, Search, AlertCircle,
    Loader2, ChevronDown, Calendar,
} from 'lucide-react'
import { useCreateQuote, QuoteLine } from '@/hooks/useQuotes'
import { useProducts } from '@/hooks/useProducts'
import { useCustomers } from '@/hooks/useCustomers'
import { useCurrency } from '@/hooks/useCurrency'
import toast from 'react-hot-toast'

interface Props {
    onClose:   () => void
    onSaved:   () => void
    // Opcional: líneas precargadas desde el POS
    initialLines?: QuoteLine[]
    initialCustomerId?: string
}

export default function QuoteModal({ onClose, onSaved, initialLines = [], initialCustomerId }: Props) {
    const { format } = useCurrency()
    const [customerId,  setCustomerId]  = useState(initialCustomerId ?? '')
    const [discount,    setDiscount]    = useState(0)
    const [notes,       setNotes]       = useState('')
    const [validUntil,  setValidUntil]  = useState('')
    const [lines,       setLines]       = useState<QuoteLine[]>(initialLines)
    const [productSearch, setProductSearch] = useState('')
    const [error,       setError]       = useState('')

    const createQuote  = useCreateQuote()
    const { data: products = [] } = useProducts({ search: productSearch || undefined })
    const { data: customers = [] } = useCustomers()

    const subtotal = lines.reduce((acc, l) => acc + (l.quantity * l.unitPrice * (1 - (l.discount ?? 0) / 100)), 0)
    const total    = subtotal * (1 - discount / 100)

    const addLine = (product: any) => {
        const exists = lines.find(l => l.productId === product.id)
        if (exists) {
            setLines(lines.map(l => l.productId === product.id
                ? { ...l, quantity: l.quantity + 1, subtotal: (l.quantity + 1) * l.unitPrice }
                : l
            ))
        } else {
            setLines([...lines, {
                productId:   product.id,
                productName: product.name,
                quantity:    1,
                unitPrice:   Number(product.price),
                discount:    0,
                subtotal:    Number(product.price),
            }])
        }
        setProductSearch('')
    }

    const removeLine = (productId: string) =>
        setLines(lines.filter(l => l.productId !== productId))

    const updateLine = (productId: string, field: keyof QuoteLine, value: number) => {
        setLines(lines.map(l => {
            if (l.productId !== productId) return l
            const updated = { ...l, [field]: value }
            updated.subtotal = updated.quantity * updated.unitPrice * (1 - (updated.discount ?? 0) / 100)
            return updated
        }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (lines.length === 0) { setError('Agregá al menos un producto'); return }
        setError('')
        try {
            await createQuote.mutateAsync({
                customerId:  customerId || undefined,
                discount,
                notes:       notes || undefined,
                validUntil:  validUntil || undefined,
                lines,
            })
            toast.success('Cotización creada')
            onSaved()
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Error al crear la cotización')
        }
    }

    const filteredProducts = (products as any[]).filter(p =>
        productSearch.length > 1
            ? p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.includes(productSearch)
            : false
    )

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
            <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '640px',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                animation: 'fadeIn 0.2s ease',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0,
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Nueva cotización</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {error && (
                        <div style={{
                            background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.25)',
                            borderRadius: 'var(--radius-md)', padding: '10px 14px',
                            display: 'flex', gap: '8px', alignItems: 'center',
                            marginBottom: '16px', fontSize: '13px', color: 'var(--danger)',
                        }}>
                            <AlertCircle size={14} />{error}
                        </div>
                    )}

                    {/* Cliente y fecha */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Cliente
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className="input-base"
                                    value={customerId}
                                    onChange={e => setCustomerId(e.target.value)}
                                    style={{ padding: '9px 28px 9px 12px', fontSize: '13px', appearance: 'none' }}
                                >
                                    <option value="">Sin cliente</option>
                                    {(customers as any[]).map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={13} color="var(--text-muted)" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Válido hasta
                            </label>
                            <input
                                type="date"
                                className="input-base"
                                value={validUntil}
                                onChange={e => setValidUntil(e.target.value)}
                                style={{ padding: '9px 12px', fontSize: '13px' }}
                            />
                        </div>
                    </div>

                    {/* Buscar producto */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Agregar productos
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                className="input-base"
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                placeholder="Buscar por nombre o SKU..."
                                style={{ padding: '9px 12px 9px 32px', fontSize: '13px' }}
                            />
                            {/* Dropdown resultados */}
                            {filteredProducts.length > 0 && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)', marginTop: '4px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                    maxHeight: '200px', overflowY: 'auto',
                                }}>
                                    {filteredProducts.map((p: any) => (
                                        <div
                                            key={p.id}
                                            onClick={() => addLine(p)}
                                            style={{
                                                padding: '10px 14px', cursor: 'pointer',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                borderBottom: '1px solid var(--border)', fontSize: '13px',
                                                transition: 'background 0.1s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-overlay)'}
                                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{p.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.sku}</div>
                                            </div>
                                            <span style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                                                {format(Number(p.price))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Líneas */}
                    {lines.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '24px',
                            border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)',
                            color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px',
                        }}>
                            Buscá un producto para agregarlo a la cotización
                        </div>
                    ) : (
                        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {/* Header tabla */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 70px 100px 70px 80px 32px',
                                gap: '8px', padding: '6px 10px',
                                fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
                                letterSpacing: '0.4px', textTransform: 'uppercase',
                            }}>
                                <span>Producto</span>
                                <span style={{ textAlign: 'center' }}>Cant.</span>
                                <span style={{ textAlign: 'right' }}>Precio</span>
                                <span style={{ textAlign: 'center' }}>Desc.%</span>
                                <span style={{ textAlign: 'right' }}>Total</span>
                                <span></span>
                            </div>
                            {lines.map(line => (
                                <div key={line.productId} style={{
                                    display: 'grid', gridTemplateColumns: '1fr 70px 100px 70px 80px 32px',
                                    gap: '8px', padding: '8px 10px', alignItems: 'center',
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                }}>
                                    <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {line.productName}
                                    </div>
                                    <input
                                        type="number" min="0.001" step="0.001"
                                        value={line.quantity}
                                        onChange={e => updateLine(line.productId, 'quantity', Number(e.target.value))}
                                        className="input-base"
                                        style={{ padding: '4px 6px', fontSize: '12px', textAlign: 'center' }}
                                    />
                                    <input
                                        type="number" min="0" step="1"
                                        value={line.unitPrice}
                                        onChange={e => updateLine(line.productId, 'unitPrice', Number(e.target.value))}
                                        className="input-base"
                                        style={{ padding: '4px 6px', fontSize: '12px', textAlign: 'right' }}
                                    />
                                    <input
                                        type="number" min="0" max="100"
                                        value={line.discount ?? 0}
                                        onChange={e => updateLine(line.productId, 'discount', Number(e.target.value))}
                                        className="input-base"
                                        style={{ padding: '4px 6px', fontSize: '12px', textAlign: 'center' }}
                                    />
                                    <div style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                                        {format(line.subtotal ?? 0)}
                                    </div>
                                    <button
                                        onClick={() => removeLine(line.productId)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'}
                                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'}
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Descuento global y notas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Descuento global (%)
                            </label>
                            <input
                                type="number" min="0" max="100"
                                className="input-base"
                                value={discount}
                                onChange={e => setDiscount(Number(e.target.value))}
                                style={{ padding: '9px 12px', fontSize: '13px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Notas
                            </label>
                            <input
                                className="input-base"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Notas opcionales..."
                                style={{ padding: '9px 12px', fontSize: '13px' }}
                            />
                        </div>
                    </div>

                    {/* Totales */}
                    {lines.length > 0 && (
                        <div style={{
                            background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)',
                            padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                <span>Subtotal</span>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>{format(subtotal)}</span>
                            </div>
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--accent)' }}>
                                    <span>Descuento {discount}%</span>
                                    <span style={{ fontFamily: 'var(--font-mono)' }}>-{format(subtotal * discount / 100)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                                <span>Total</span>
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{format(total)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '11px', fontSize: '13px' }}>
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={createQuote.isPending || lines.length === 0}
                        className="btn-accent"
                        style={{
                            flex: 2, padding: '11px', fontSize: '13px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: lines.length === 0 ? 0.5 : 1,
                        }}
                    >
                        {createQuote.isPending && <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
                        Crear cotización
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
            `}</style>
        </div>
    )
}
