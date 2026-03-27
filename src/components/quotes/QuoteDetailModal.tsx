'use client'
import { useState } from 'react'
import {
    X, CheckCircle, XCircle, ShoppingCart,
    Printer, Send, Loader2, AlertCircle,
    Clock, ChevronDown,
} from 'lucide-react'
import { Quote, useUpdateQuote, useConvertQuote } from '@/hooks/useQuotes'
import { useCurrentRegister } from '@/hooks/useCash'
import { useCurrency } from '@/hooks/useCurrency'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
    PENDING:   { label: 'Pendiente',  color: 'var(--warning)',    bg: 'rgba(251,191,36,0.1)' },
    ACCEPTED:  { label: 'Aceptada',   color: 'var(--success)',    bg: 'var(--success-bg)'    },
    REJECTED:  { label: 'Rechazada',  color: 'var(--danger)',     bg: 'var(--danger-bg)'     },
    EXPIRED:   { label: 'Vencida',    color: 'var(--text-muted)', bg: 'var(--bg-overlay)'    },
    CONVERTED: { label: 'Convertida', color: 'var(--info)',       bg: 'var(--info-bg)'       },
}

interface Props {
    quote:      Quote
    onClose:    () => void
    onUpdated:  () => void
}

export default function QuoteDetailModal({ quote, onClose, onUpdated }: Props) {
    const { format } = useCurrency()
    const [paymentMethod, setPaymentMethod] = useState('CASH')
    const [converting,    setConverting]    = useState(false)

    const updateQuote  = useUpdateQuote()
    const convertQuote = useConvertQuote()
    const { data: register } = useCurrentRegister()

    const st = STATUS_CONFIG[quote.status]

    const handleStatusChange = async (status: string) => {
        try {
            await updateQuote.mutateAsync({ id: quote.id, status })
            toast.success(`Cotización ${STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label.toLowerCase()}`)
            onUpdated()
        } catch {
            toast.error('Error al actualizar')
        }
    }

    const handleConvert = async () => {
        if (!register) { toast.error('Debés tener la caja abierta para convertir en venta'); return }
        setConverting(true)
        try {
            await convertQuote.mutateAsync({
                id:             quote.id,
                cashRegisterId: register.id,
                paymentMethod,
            })
            toast.success('¡Cotización convertida en venta!')
            onUpdated()
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Error al convertir')
        } finally {
            setConverting(false)
        }
    }

    const handlePrint = () => window.print()

    const handleWhatsApp = () => {
        const customer = quote.customer
        if (!customer?.phone) { toast.error('El cliente no tiene teléfono registrado'); return }

        const lines = quote.lines.map(l =>
            `• ${l.productName} x${l.quantity} = ${format(Number(l.subtotal))}`
        ).join('\n')

        const msg = encodeURIComponent(
            `Hola ${customer.name}, te enviamos la cotización *${quote.quoteNumber}*:\n\n` +
            `${lines}\n\n` +
            `*Total: ${format(Number(quote.total))}*\n` +
            (quote.validUntil ? `Válida hasta: ${new Date(quote.validUntil).toLocaleDateString('es-CR')}\n` : '') +
            (quote.notes ? `\nNotas: ${quote.notes}` : '')
        )

        window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
            <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '580px',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                animation: 'fadeIn 0.2s ease',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700 }}>
                            {quote.quoteNumber}
                        </span>
                        <span style={{
                            fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px',
                            background: st.bg, color: st.color,
                        }}>
                            {st.label}
                        </span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                    {/* Info cliente y fecha */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Cliente</div>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{quote.customer?.name ?? 'Sin cliente'}</div>
                            {quote.customer?.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{quote.customer.phone}</div>}
                            {quote.customer?.email && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{quote.customer.email}</div>}
                        </div>
                        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Fechas</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                Creada: {new Date(quote.createdAt).toLocaleDateString('es-CR')}
                            </div>
                            {quote.validUntil && (
                                <div style={{ fontSize: '12px', color: new Date(quote.validUntil) < new Date() ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                    Válida hasta: {new Date(quote.validUntil).toLocaleDateString('es-CR')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Líneas */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            Productos ({quote.lines.length})
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            {quote.lines.map((l, i) => (
                                <div key={l.id ?? i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 14px',
                                    borderBottom: i < quote.lines.length - 1 ? '1px solid var(--border)' : 'none',
                                    fontSize: '13px',
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{l.productName}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            {l.quantity} × {format(Number(l.unitPrice))}
                                            {(l.discount ?? 0) > 0 && <span style={{ color: 'var(--accent)', marginLeft: 6 }}>-{l.discount}%</span>}
                                        </div>
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
                                        {format(Number(l.subtotal))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totales */}
                    <div style={{ background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            <span>Subtotal</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{format(Number(quote.subtotal))}</span>
                        </div>
                        {Number(quote.discount) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--accent)', marginBottom: '6px' }}>
                                <span>Descuento {quote.discount}%</span>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>-{format(Number(quote.subtotal) * Number(quote.discount) / 100)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                            <span>Total</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{format(Number(quote.total))}</span>
                        </div>
                    </div>

                    {quote.notes && (
                        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Notas: </span>
                            {quote.notes}
                        </div>
                    )}

                    {/* Convertir a venta */}
                    {(quote.status === 'PENDING' || quote.status === 'ACCEPTED') && (
                        <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--accent)' }}>
                                Convertir en venta
                            </div>
                            {!register ? (
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertCircle size={13} /> Debés tener la caja abierta para convertir en venta
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <select
                                            className="input-base"
                                            value={paymentMethod}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                            style={{ padding: '8px 28px 8px 12px', fontSize: '13px', appearance: 'none' }}
                                        >
                                            <option value="CASH">Efectivo</option>
                                            <option value="CARD">Tarjeta</option>
                                            <option value="SINPE">SINPE</option>
                                            <option value="TRANSFER">Transferencia</option>
                                        </select>
                                        <ChevronDown size={13} color="var(--text-muted)" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    </div>
                                    <button
                                        onClick={handleConvert}
                                        disabled={converting}
                                        className="btn-accent"
                                        style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                                    >
                                        {converting ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ShoppingCart size={13} />}
                                        Convertir
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer acciones */}
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                    {/* Acciones de estado */}
                    {quote.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => handleStatusChange('ACCEPTED')}
                                disabled={updateQuote.isPending}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '9px 14px', borderRadius: 'var(--radius-md)',
                                    background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.25)',
                                    color: 'var(--success)', fontSize: '13px', fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                <CheckCircle size={13} /> Aceptar
                            </button>
                            <button
                                onClick={() => handleStatusChange('REJECTED')}
                                disabled={updateQuote.isPending}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '9px 14px', borderRadius: 'var(--radius-md)',
                                    background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.25)',
                                    color: 'var(--danger)', fontSize: '13px', fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                <XCircle size={13} /> Rechazar
                            </button>
                        </>
                    )}

                    <div style={{ flex: 1 }} />

                    {/* WhatsApp */}
                    {quote.customer?.phone && (
                        <button
                            onClick={handleWhatsApp}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '9px 14px', borderRadius: 'var(--radius-md)',
                                background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)',
                                color: '#25d366', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            <Send size={13} /> WhatsApp
                        </button>
                    )}

                    {/* Imprimir */}
                    <button
                        onClick={handlePrint}
                        className="btn-ghost"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '13px' }}
                    >
                        <Printer size={13} /> Imprimir
                    </button>

                    <button onClick={onClose} className="btn-ghost" style={{ padding: '9px 14px', fontSize: '13px' }}>
                        Cerrar
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
                @keyframes spin { to { transform: rotate(360deg) } }
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                }
            `}</style>
        </div>
    )
}
