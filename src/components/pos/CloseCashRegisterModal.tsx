'use client'
import { useState } from 'react'
import {
    X, CheckCircle,
    TrendingUp, Hash,
    CreditCard, Banknote,
    Smartphone, ArrowLeftRight,
    Clock, AlertTriangle
} from 'lucide-react'
import {
    useRegisterSummary,
    useCloseRegister
} from '@/hooks/useCash'
import { formatCRC } from '@/lib/utils'
import toast from 'react-hot-toast'

const METHOD_CFG: Record<string, { label: string; color: string; icon: any }> = {
    CASH: { label: 'Efectivo', color: '#34d399', icon: Banknote },
    CARD: { label: 'Tarjeta', color: '#60a5fa', icon: CreditCard },
    SINPE: { label: 'SINPE', color: '#f5a623', icon: Smartphone },
    TRANSFER: { label: 'Transferencia', color: '#a78bfa', icon: ArrowLeftRight },
    CREDIT: { label: 'Fiado', color: '#f87171', icon: Clock },
}

interface Props {
    registerId: string
    onClose: () => void
    onClosed: () => void
}

export default function CloseCashRegisterModal({ registerId, onClose, onClosed }: Props) {
    const [closing, setClosing] = useState(false)
    const [closingAmount, setClosingAmount] = useState('')
    const [notes, setNotes] = useState('')
    const [done, setDone] = useState(false)
    const [result, setResult] = useState<any>(null)

    const { data: summary, isLoading } = useRegisterSummary(registerId)
    const closeRegister = useCloseRegister()

    const closingNum = parseFloat(closingAmount) || 0
    const expected = Number(summary?.totalSales ?? 0) +
        Number(summary?.register?.openingAmount ?? 0)
    const difference = closingNum - expected
    const hasDiff = Math.abs(difference) > 0

    const handleClose = async () => {
        if (!closingAmount) {
            toast.error('Ingresá el monto final en caja')
            return
        }
        setClosing(true)
        try {
            const res = await closeRegister.mutateAsync({
                id: registerId,
                closingAmount: closingNum,
                notes,
            })
            setResult(res)
            setDone(true)
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Error al cerrar la caja')
        } finally {
            setClosing(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
            <div className="card animate-pop" style={{
                width: 500, maxWidth: '95vw', maxHeight: '90vh',
                overflowY: 'auto',
            }}>

                {/* ── Success ── */}
                {done ? (
                    <div style={{
                        padding: '40px 32px', textAlign: 'center',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'var(--success-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CheckCircle size={32} color="var(--success)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                                Caja cerrada correctamente
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                {new Date().toLocaleString('es-CR', { dateStyle: 'full', timeStyle: 'short' })}
                            </div>
                        </div>

                        {/* Resumen final */}
                        <div style={{
                            width: '100%', background: 'var(--bg-overlay)',
                            borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                            display: 'flex', flexDirection: 'column', gap: '8px',
                        }}>
                            {[
                                { label: 'Total ventas', value: formatCRC(Number(result?.totalSales ?? 0)), color: 'var(--accent)' },
                                { label: 'Monto esperado', value: formatCRC(Number(result?.expectedAmount ?? 0)), color: 'var(--info)' },
                                { label: 'Monto contado', value: formatCRC(Number(result?.closingAmount ?? 0)), color: 'var(--text-primary)' },
                                {
                                    label: 'Diferencia',
                                    value: formatCRC(Math.abs(Number(result?.difference ?? 0))),
                                    color: Math.abs(Number(result?.difference ?? 0)) === 0
                                        ? 'var(--success)'
                                        : 'var(--danger)',
                                    extra: Math.abs(Number(result?.difference ?? 0)) === 0
                                        ? '✓ Cuadra perfectamente'
                                        : Number(result?.difference ?? 0) > 0 ? '↑ Sobrante' : '↓ Faltante',
                                },
                            ].map(row => (
                                <div key={row.label} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    fontSize: '13px',
                                }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {row.extra && (
                                            <span style={{ fontSize: '11px', color: row.color, fontWeight: 600 }}>
                                                {row.extra}
                                            </span>
                                        )}
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: row.color }}>
                                            {row.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onClosed}
                            className="btn-accent"
                            style={{ width: '100%', padding: '13px', fontSize: '14px' }}
                        >
                            Finalizar
                        </button>
                    </div>

                ) : (
                    <>
                        {/* ── Header ── */}
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '16px' }}>Cerrar caja</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    Resumen y arqueo del turno
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {isLoading ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    Cargando resumen...
                                </div>
                            ) : (
                                <>
                                    {/* ── Stats del turno ── */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                                        {[
                                            {
                                                label: 'Total ventas',
                                                value: formatCRC(Number(summary?.totalSales ?? 0)),
                                                color: 'var(--accent)',
                                                icon: <TrendingUp size={14} />,
                                                mono: true,
                                            },
                                            {
                                                label: 'Órdenes',
                                                value: summary?.totalOrders ?? 0,
                                                color: 'var(--info)',
                                                icon: <Hash size={14} />,
                                            },
                                            {
                                                label: 'Monto inicial',
                                                value: formatCRC(Number(summary?.register?.openingAmount ?? 0)),
                                                color: 'var(--text-secondary)',
                                                icon: <Banknote size={14} />,
                                                mono: true,
                                            },
                                        ].map(s => (
                                            <div key={s.label} style={{
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-md)', padding: '12px 14px',
                                            }}>
                                                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '6px' }}>
                                                    <span style={{ color: s.color }}>{s.icon}</span>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                        {s.label}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    fontSize: '16px', fontWeight: 700, color: s.color,
                                                    fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                                                }}>
                                                    {s.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ── Por método de pago ── */}
                                    {summary?.byMethod && summary.byMethod.length > 0 && (
                                        <div style={{
                                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)', padding: '14px 16px',
                                        }}>
                                            <div style={{
                                                fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
                                                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px',
                                            }}>
                                                Desglose por método de pago
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {summary.byMethod.map((m: any) => {
                                                    const cfg = METHOD_CFG[m.paymentMethod] ?? METHOD_CFG.CASH
                                                    const Icon = cfg.icon
                                                    return (
                                                        <div key={m.paymentMethod} style={{
                                                            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px',
                                                        }}>
                                                            <div style={{
                                                                width: 28, height: 28, borderRadius: '7px', flexShrink: 0,
                                                                background: `${cfg.color}18`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}>
                                                                <Icon size={13} color={cfg.color} />
                                                            </div>
                                                            <span style={{ flex: 1, color: 'var(--text-secondary)' }}>
                                                                {cfg.label}
                                                            </span>
                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                {m._count?.id ?? 0} trx
                                                            </span>
                                                            <span style={{
                                                                fontFamily: 'var(--font-mono)', fontWeight: 700, color: cfg.color,
                                                            }}>
                                                                {formatCRC(Number(m._sum?.total ?? 0))}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Arqueo ── */}
                                    <div>
                                        <label style={{
                                            fontSize: '12px', color: 'var(--text-secondary)',
                                            display: 'block', marginBottom: '6px', fontWeight: 500,
                                        }}>
                                            Monto contado en caja
                                        </label>
                                        <input
                                            type="number"
                                            autoFocus
                                            min="0"
                                            placeholder="0"
                                            value={closingAmount}
                                            onChange={e => setClosingAmount(e.target.value)}
                                            className="input-base"
                                            style={{
                                                width: '100%', padding: '12px 14px',
                                                fontSize: '22px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                                            }}
                                        />

                                        {/* Diferencia en tiempo real */}
                                        {closingNum > 0 && (
                                            <div style={{
                                                marginTop: '10px', padding: '12px 14px',
                                                borderRadius: 'var(--radius-md)',
                                                background: !hasDiff
                                                    ? 'var(--success-bg)'
                                                    : 'var(--danger-bg)',
                                                border: `1px solid ${!hasDiff
                                                    ? 'rgba(52,211,153,0.3)'
                                                    : 'rgba(248,113,113,0.3)'}`,
                                            }}>
                                                <div style={{
                                                    display: 'flex', justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {!hasDiff
                                                            ? <CheckCircle size={14} color="var(--success)" />
                                                            : <AlertTriangle size={14} color="var(--danger)" />
                                                        }
                                                        <span style={{
                                                            fontSize: '13px', fontWeight: 600,
                                                            color: !hasDiff ? 'var(--success)' : 'var(--danger)',
                                                        }}>
                                                            {!hasDiff
                                                                ? 'Caja cuadrada perfectamente'
                                                                : difference > 0 ? 'Sobrante en caja' : 'Faltante en caja'
                                                            }
                                                        </span>
                                                    </div>
                                                    {hasDiff && (
                                                        <span style={{
                                                            fontFamily: 'var(--font-mono)', fontWeight: 700,
                                                            fontSize: '15px', color: 'var(--danger)',
                                                        }}>
                                                            {formatCRC(Math.abs(difference))}
                                                        </span>
                                                    )}
                                                </div>
                                                {hasDiff && (
                                                    <div style={{
                                                        marginTop: '6px', fontSize: '11px',
                                                        color: 'var(--text-secondary)',
                                                    }}>
                                                        Esperado: {formatCRC(expected)} · Contado: {formatCRC(closingNum)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Notas ── */}
                                    <div>
                                        <label style={{
                                            fontSize: '12px', color: 'var(--text-secondary)',
                                            display: 'block', marginBottom: '6px', fontWeight: 500,
                                        }}>
                                            Notas del cierre (opcional)
                                        </label>
                                        <textarea
                                            className="input-base"
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="Observaciones, incidencias del turno..."
                                            rows={2}
                                            style={{ width: '100%', padding: '9px 12px', fontSize: '13px', resize: 'vertical' }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* ── Botones ── */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '12px' }}>
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleClose}
                                    disabled={!closingAmount || closing}
                                    className="btn-accent"
                                    style={{
                                        flex: 2, padding: '12px', fontSize: '14px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                                        opacity: !closingAmount ? 0.4 : 1,
                                    }}
                                >
                                    {closing ? 'Cerrando...' : 'Confirmar cierre de caja'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}