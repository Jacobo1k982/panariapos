'use client'
import { useState } from 'react'
import {
    ShoppingBag, Search, Calendar, X,
    CreditCard, Banknote, Smartphone,
    ArrowLeftRight, Clock, CheckCircle,
    TrendingUp, Hash
} from 'lucide-react'
import { useSales, useDailySummary } from '@/hooks/useSales'
import { useCurrency } from '@/hooks/useCurrency'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const METHOD_CFG: Record<string, { label: string; color: string; icon: any }> = {
    CASH: { label: 'Efectivo', color: '#34d399', icon: Banknote },
    CARD: { label: 'Tarjeta', color: '#60a5fa', icon: CreditCard },
    SINPE: { label: 'SINPE', color: '#f5a623', icon: Smartphone },
    TRANSFER: { label: 'Transferencia', color: '#a78bfa', icon: ArrowLeftRight },
    CREDIT: { label: 'Fiado', color: '#f87171', icon: Clock },
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
    COMPLETED: { label: 'Completada', color: 'var(--success)', bg: 'var(--success-bg)' },
    REFUNDED: { label: 'Devuelta', color: 'var(--warning)', bg: 'rgba(251,191,36,0.10)' },
    CANCELLED: { label: 'Cancelada', color: 'var(--danger)', bg: 'var(--danger-bg)' },
}

function today() {
    return new Date().toISOString().split('T')[0]
}

function thisMonth() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function SalesPage() {
    const { format } = useCurrency()

    const [search, setSearch] = useState('')
    const [from, setFrom] = useState(thisMonth())
    const [to, setTo] = useState(today())
    const [method, setMethod] = useState('')
    const [selected, setSelected] = useState<any>(null)

    // ── Datos de la API ────────────────────────────────────────────────────────
    const { data: sales = [], isLoading } = useSales({ from, to, limit: 200 })
    const { data: summary } = useDailySummary()

    // ── Filtrar localmente ─────────────────────────────────────────────────────
    const filtered = (sales as any[]).filter(s => {
        const q = search.toLowerCase()
        const matchSearch = search
            ? s.receiptNumber?.includes(search) ||
            s.customer?.name?.toLowerCase().includes(q) ||
            s.user?.name?.toLowerCase().includes(q)
            : true
        const matchMethod = method ? s.paymentMethod === method : true
        return matchSearch && matchMethod
    })

    const totalFiltered = filtered.reduce((a: number, s: any) => a + Number(s.total), 0)

    const resetFilters = () => {
        setSearch('')
        setMethod('')
        setFrom(thisMonth())
        setTo(today())
    }

    const hasFilters = search || method || from !== thisMonth() || to !== today()

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

            {/* ══════════════════════════════════════════════════════════════════════
          Panel izquierdo — Lista
      ══════════════════════════════════════════════════════════════════════ */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                borderRight: selected ? '1px solid var(--border)' : 'none',
                overflow: 'hidden',
            }}>

                {/* ── Stats del día ── */}
                <div style={{
                    padding: '16px 20px 0',
                    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px',
                    flexShrink: 0,
                }}>
                    {[
                        {
                            label: 'Ingresos hoy',
                            value: format(summary?.totalRevenue ?? 0),
                            color: 'var(--accent)',
                            mono: true,
                            icon: <TrendingUp size={13} />,
                        },
                        {
                            label: 'Órdenes hoy',
                            value: summary?.totalOrders ?? 0,
                            color: 'var(--info)',
                            icon: <ShoppingBag size={13} />,
                        },
                        {
                            label: 'Ventas en rango',
                            value: filtered.length,
                            color: 'var(--success)',
                            icon: <Hash size={13} />,
                        },
                        {
                            label: 'Total filtrado',
                            value: format(totalFiltered),
                            color: 'var(--text-primary)',
                            mono: true,
                            icon: <TrendingUp size={13} />,
                        },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)', padding: '12px 14px',
                        }}>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ color: s.color }}>{s.icon}</span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                    {s.label}
                                </span>
                            </div>
                            <div style={{
                                fontSize: '18px', fontWeight: 700, color: s.color,
                                fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                                letterSpacing: s.mono ? '-0.5px' : '0',
                            }}>
                                {s.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filtros ── */}
                <div style={{
                    padding: '12px 20px',
                    display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
                    flexShrink: 0,
                }}>

                    {/* Búsqueda */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
                        <Search
                            size={13}
                            color="var(--text-muted)"
                            style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <input
                            className="input-base"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Nº recibo, cliente o cajero..."
                            style={{ width: '100%', padding: '8px 10px 8px 28px', fontSize: '13px' }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                style={{
                                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                }}
                            >
                                <X size={11} color="var(--text-muted)" />
                            </button>
                        )}
                    </div>

                    {/* Fecha desde */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        <input
                            type="date"
                            className="input-base"
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                            style={{ padding: '8px 10px', fontSize: '13px' }}
                        />
                    </div>

                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>

                    {/* Fecha hasta */}
                    <input
                        type="date"
                        className="input-base"
                        value={to}
                        max={today()}
                        onChange={e => setTo(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '13px' }}
                    />

                    {/* Método de pago */}
                    <select
                        className="input-base"
                        value={method}
                        onChange={e => setMethod(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '13px', cursor: 'pointer' }}
                    >
                        <option value="">Todos los métodos</option>
                        {Object.entries(METHOD_CFG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>

                    {/* Limpiar */}
                    {hasFilters && (
                        <button
                            onClick={resetFilters}
                            className="btn-ghost"
                            style={{
                                padding: '8px 12px', fontSize: '12px',
                                display: 'flex', alignItems: 'center', gap: '5px',
                            }}
                        >
                            <X size={12} /> Limpiar
                        </button>
                    )}
                </div>

                {/* ── Lista de ventas ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
                    {isLoading ? (
                        <div style={{
                            textAlign: 'center', padding: '60px',
                            color: 'var(--text-muted)', fontSize: '13px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                        }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                border: '2px solid var(--border)',
                                borderTopColor: 'var(--accent)',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                            Cargando ventas...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '48px',
                            background: 'var(--bg-surface)',
                            border: '1px dashed var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                        }}>
                            <ShoppingBag size={36} color="var(--text-muted)" />
                            <div style={{ fontSize: '15px', fontWeight: 500 }}>Sin ventas</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {hasFilters
                                    ? 'No hay ventas con los filtros aplicados'
                                    : 'No hay ventas registradas en este período'
                                }
                            </div>
                            {hasFilters && (
                                <button onClick={resetFilters} className="btn-ghost"
                                    style={{ padding: '7px 16px', fontSize: '12px', marginTop: '4px' }}>
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {filtered.map((sale: any) => {
                                const mcfg = METHOD_CFG[sale.paymentMethod] ?? METHOD_CFG.CASH
                                const scfg = STATUS_CFG[sale.status] ?? STATUS_CFG.COMPLETED
                                const Icon = mcfg.icon
                                const isSelected = selected?.id === sale.id

                                return (
                                    <div
                                        key={sale.id}
                                        onClick={() => setSelected(isSelected ? null : sale)}
                                        style={{
                                            background: isSelected ? 'var(--bg-overlay)' : 'var(--bg-surface)',
                                            border: `1px solid ${isSelected ? 'var(--border-hover)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius-lg)', padding: '12px 16px',
                                            cursor: 'pointer', transition: 'all 0.15s',
                                            display: 'grid',
                                            gridTemplateColumns: '38px 1fr auto auto',
                                            gap: '12px', alignItems: 'center',
                                        }}
                                        onMouseEnter={e => {
                                            if (!isSelected)
                                                (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)'
                                        }}
                                        onMouseLeave={e => {
                                            if (!isSelected)
                                                (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'
                                        }}
                                    >
                                        {/* Ícono método de pago */}
                                        <div style={{
                                            width: 38, height: 38, borderRadius: '8px', flexShrink: 0,
                                            background: `${mcfg.color}18`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Icon size={16} color={mcfg.color} />
                                        </div>

                                        {/* Info principal */}
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center',
                                                gap: '7px', marginBottom: '3px',
                                            }}>
                                                <span style={{
                                                    fontWeight: 700, fontSize: '13px',
                                                    fontFamily: 'var(--font-mono)',
                                                }}>
                                                    #{sale.receiptNumber}
                                                </span>
                                                <span style={{
                                                    fontSize: '10px', fontWeight: 600,
                                                    padding: '1px 6px', borderRadius: '20px',
                                                    color: scfg.color, background: scfg.bg,
                                                }}>
                                                    {scfg.label}
                                                </span>
                                                <span style={{
                                                    fontSize: '10px', color: mcfg.color,
                                                    background: `${mcfg.color}15`,
                                                    padding: '1px 6px', borderRadius: '20px',
                                                }}>
                                                    {mcfg.label}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: '11px', color: 'var(--text-muted)',
                                                display: 'flex', gap: '10px', flexWrap: 'wrap',
                                            }}>
                                                <span>
                                                    🕐 {new Date(sale.createdAt).toLocaleString('es-CR', {
                                                        dateStyle: 'short', timeStyle: 'short',
                                                    })}
                                                </span>
                                                {sale.customer?.name && (
                                                    <span>👤 {sale.customer.name}</span>
                                                )}
                                                <span>👨‍💼 {sale.user?.name}</span>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <span style={{
                                            fontSize: '11px', color: 'var(--text-muted)',
                                            flexShrink: 0, whiteSpace: 'nowrap',
                                        }}>
                                            {sale.lines?.length ?? 0} ítem{(sale.lines?.length ?? 0) !== 1 ? 's' : ''}
                                        </span>

                                        {/* Total */}
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{
                                                fontFamily: 'var(--font-mono)', fontWeight: 700,
                                                fontSize: '15px', color: 'var(--accent)',
                                            }}>
                                                {format(Number(sale.total))}
                                            </div>
                                            {Number(sale.discount) > 0 && (
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                                                    −{sale.discount}% dto
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
          Panel derecho — Detalle de venta
      ══════════════════════════════════════════════════════════════════════ */}
            {selected && (
                <div style={{
                    width: '360px', flexShrink: 0, overflow: 'hidden',
                    background: 'var(--bg-surface)',
                    display: 'flex', flexDirection: 'column',
                }}>

                    {/* Header */}
                    <div style={{
                        padding: '18px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    }}>
                        <div>
                            <div style={{
                                fontWeight: 700, fontSize: '17px',
                                fontFamily: 'var(--font-mono)', marginBottom: '4px',
                            }}>
                                Venta #{selected.receiptNumber}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {new Date(selected.createdAt).toLocaleString('es-CR', {
                                    dateStyle: 'full', timeStyle: 'short',
                                })}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelected(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '3px' }}
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Info de la venta */}
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {[
                                { label: 'Cajero', value: selected.user?.name ?? '—' },
                                { label: 'Método', value: METHOD_CFG[selected.paymentMethod]?.label ?? selected.paymentMethod },
                                { label: 'Cliente', value: selected.customer?.name ?? 'Público general' },
                                { label: 'Estado', value: STATUS_CFG[selected.status]?.label ?? selected.status },
                            ].map(info => (
                                <div key={info.label} style={{
                                    background: 'var(--bg-elevated)',
                                    borderRadius: 'var(--radius-md)', padding: '9px 12px',
                                }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                                        {info.label}
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{info.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Referencia de pago */}
                        {selected.paymentRef && (
                            <div style={{
                                marginTop: '8px', padding: '8px 12px',
                                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '12px', color: 'var(--text-secondary)',
                            }}>
                                📱 Ref. pago:{' '}
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                    {selected.paymentRef}
                                </span>
                            </div>
                        )}

                        {/* Notas */}
                        {selected.notes && (
                            <div style={{
                                marginTop: '8px', padding: '8px 12px',
                                background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '12px', color: 'var(--text-secondary)',
                            }}>
                                📝 {selected.notes}
                            </div>
                        )}
                    </div>

                    {/* Líneas de venta */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
                        <div style={{
                            fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px',
                        }}>
                            Productos vendidos
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {selected.lines?.map((line: any) => (
                                <div key={line.id} style={{
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)', padding: '10px 14px',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '13px', fontWeight: 500, marginBottom: '2px',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {line.productName}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            {Number(line.quantity)} × {format(Number(line.unitPrice))}
                                            {Number(line.discount) > 0 && (
                                                <span style={{ color: 'var(--accent)', marginLeft: 6 }}>
                                                    −{line.discount}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)', fontWeight: 600,
                                        fontSize: '14px', flexShrink: 0,
                                    }}>
                                        {format(Number(line.subtotal))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totales */}
                    <div style={{
                        borderTop: '1px solid var(--border)',
                        padding: '14px 18px', flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>

                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: '13px', color: 'var(--text-secondary)',
                            }}>
                                <span>Subtotal</span>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>
                                    {format(Number(selected.subtotal))}
                                </span>
                            </div>

                            {Number(selected.discount) > 0 && (
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    fontSize: '13px', color: 'var(--accent)',
                                }}>
                                    <span>Descuento ({selected.discount}%)</span>
                                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                                        −{format(Number(selected.subtotal) - Number(selected.total))}
                                    </span>
                                </div>
                            )}

                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'baseline',
                                paddingTop: '8px', borderTop: '1px solid var(--border)',
                            }}>
                                <span style={{ fontWeight: 600, fontSize: '15px' }}>Total</span>
                                <span style={{
                                    fontFamily: 'var(--font-mono)', fontWeight: 700,
                                    fontSize: '22px', color: 'var(--accent)',
                                }}>
                                    {format(Number(selected.total))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
        </div>
    )
}