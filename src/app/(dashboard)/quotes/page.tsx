'use client'
import { useState } from 'react'
import {
    FileText, Plus, Search, Filter, Eye,
    CheckCircle, XCircle, Clock, ShoppingCart,
    ChevronDown, AlertCircle, Loader2, X,
    Send, Printer, RefreshCw,
} from 'lucide-react'
import { useQuotes, useUpdateQuote, Quote } from '@/hooks/useQuotes'
import { useCurrentRegister } from '@/hooks/useCash'
import { formatCRC } from '@/lib/utils'
import QuoteModal from '@/components/quotes/QuoteModal'
import QuoteDetailModal from '@/components/quotes/QuoteDetailModal'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
    PENDING:   { label: 'Pendiente',  color: 'var(--warning)',  bg: 'rgba(251,191,36,0.1)',  icon: Clock         },
    ACCEPTED:  { label: 'Aceptada',   color: 'var(--success)',  bg: 'var(--success-bg)',     icon: CheckCircle   },
    REJECTED:  { label: 'Rechazada',  color: 'var(--danger)',   bg: 'var(--danger-bg)',      icon: XCircle       },
    EXPIRED:   { label: 'Vencida',    color: 'var(--text-muted)', bg: 'var(--bg-overlay)',   icon: AlertCircle   },
    CONVERTED: { label: 'Convertida', color: 'var(--info)',     bg: 'var(--info-bg)',        icon: ShoppingCart  },
}

export default function QuotesPage() {
    const [search,     setSearch]     = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [selected,   setSelected]   = useState<Quote | null>(null)

    const { data: quotes = [], isLoading } = useQuotes({
        search:  search || undefined,
        status:  filterStatus || undefined,
    })
    const updateQuote = useUpdateQuote()

    const handleStatusChange = async (quote: Quote, status: string) => {
        try {
            await updateQuote.mutateAsync({ id: quote.id, status })
            toast.success(`Cotización ${STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label.toLowerCase()}`)
        } catch {
            toast.error('Error al actualizar la cotización')
        }
    }

    const isExpired = (q: Quote) =>
        q.validUntil && new Date(q.validUntil) < new Date() && q.status === 'PENDING'

    return (
        <div style={{ padding: 'clamp(16px, 3vw, 28px)', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: '10px',
                        background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FileText size={18} color="var(--accent)" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Cotizaciones</h1>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                            {quotes.length} cotización{quotes.length !== 1 ? 'es' : ''}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="btn-accent"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '13px' }}
                >
                    <Plus size={14} /> Nueva cotización
                </button>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={14} color="var(--text-muted)" style={{
                        position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                    }} />
                    <input
                        className="input-base"
                        placeholder="Buscar por número o cliente..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '9px 12px 9px 32px', fontSize: '13px' }}
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <select
                        className="input-base"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: '9px 32px 9px 12px', fontSize: '13px', appearance: 'none', minWidth: '150px' }}
                    >
                        <option value="">Todos los estados</option>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={13} color="var(--text-muted)" style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                    }} />
                </div>
            </div>

            {/* Tabla */}
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <Loader2 size={24} color="var(--text-muted)" style={{ animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : quotes.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                }}>
                    <FileText size={36} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.4 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                        {search || filterStatus ? 'No se encontraron cotizaciones' : 'No hay cotizaciones aún'}
                    </p>
                    {!search && !filterStatus && (
                        <button onClick={() => setShowCreate(true)} className="btn-accent"
                            style={{ marginTop: '16px', padding: '8px 20px', fontSize: '13px' }}>
                            Crear primera cotización
                        </button>
                    )}
                </div>
            ) : (
                <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                }}>
                    {/* Desktop table */}
                    <div className="hide-mobile">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Número', 'Cliente', 'Total', 'Válido hasta', 'Estado', ''].map(h => (
                                        <th key={h} style={{
                                            padding: '10px 16px', textAlign: 'left',
                                            fontSize: '11px', fontWeight: 600,
                                            color: 'var(--text-muted)', letterSpacing: '0.5px',
                                            textTransform: 'uppercase',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {quotes.map((q, i) => {
                                    const st = STATUS_CONFIG[q.status]
                                    const Icon = st.icon
                                    const expired = isExpired(q)
                                    return (
                                        <tr key={q.id} style={{
                                            borderBottom: i < quotes.length - 1 ? '1px solid var(--border)' : 'none',
                                        }}
                                            onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-overlay)'}
                                            onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
                                                    {q.quoteNumber}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                {q.customer?.name ?? <span style={{ color: 'var(--text-muted)' }}>Sin cliente</span>}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                {formatCRC(Number(q.total))}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '12px', color: expired ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                {q.validUntil
                                                    ? new Date(q.validUntil).toLocaleDateString('es-CR')
                                                    : '—'}
                                                {expired && ' ⚠'}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                    fontSize: '11px', fontWeight: 600, padding: '3px 9px',
                                                    borderRadius: '20px',
                                                    background: st.bg, color: st.color,
                                                }}>
                                                    <Icon size={11} />
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => setSelected(q)}
                                                        title="Ver detalle"
                                                        style={{
                                                            background: 'none', border: 'none', cursor: 'pointer',
                                                            padding: '5px', borderRadius: '6px', color: 'var(--text-muted)',
                                                            display: 'flex', alignItems: 'center',
                                                        }}
                                                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-overlay)'}
                                                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    {q.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(q, 'ACCEPTED')}
                                                                title="Aceptar"
                                                                style={{
                                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                                    padding: '5px', borderRadius: '6px', color: 'var(--success)',
                                                                    display: 'flex', alignItems: 'center',
                                                                }}
                                                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--success-bg)'}
                                                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                                                            >
                                                                <CheckCircle size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(q, 'REJECTED')}
                                                                title="Rechazar"
                                                                style={{
                                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                                    padding: '5px', borderRadius: '6px', color: 'var(--danger)',
                                                                    display: 'flex', alignItems: 'center',
                                                                }}
                                                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-bg)'}
                                                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                                                            >
                                                                <XCircle size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="hide-desktop" style={{ display: 'flex', flexDirection: 'column' }}>
                        {quotes.map((q, i) => {
                            const st = STATUS_CONFIG[q.status]
                            const Icon = st.icon
                            return (
                                <div
                                    key={q.id}
                                    onClick={() => setSelected(q)}
                                    style={{
                                        padding: '14px 16px',
                                        borderBottom: i < quotes.length - 1 ? '1px solid var(--border)' : 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700 }}>
                                            {q.quoteNumber}
                                        </span>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                                            borderRadius: '20px', background: st.bg, color: st.color,
                                        }}>
                                            <Icon size={10} />{st.label}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                        {q.customer?.name ?? 'Sin cliente'}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                                            {formatCRC(Number(q.total))}
                                        </span>
                                        {q.validUntil && (
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                Válido: {new Date(q.validUntil).toLocaleDateString('es-CR')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {showCreate && (
                <QuoteModal onClose={() => setShowCreate(false)} onSaved={() => setShowCreate(false)} />
            )}

            {selected && (
                <QuoteDetailModal
                    quote={selected}
                    onClose={() => setSelected(null)}
                    onUpdated={() => setSelected(null)}
                />
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}
