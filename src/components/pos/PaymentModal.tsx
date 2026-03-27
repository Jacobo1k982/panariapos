'use client'
import { useState } from 'react'
import {
    X, Banknote, CreditCard, Smartphone,
    ArrowLeftRight, CheckCircle, Loader
} from 'lucide-react'
import { PDFDownloadLink, pdf } from '@react-pdf/renderer'
import ReceiptPDF from './ReceiptPDF'
import { useTenant } from '@/hooks/useTenant'
import { useCurrency } from '@/hooks/useCurrency'
import { format } from 'util'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Method = 'cash' | 'card' | 'sinpe' | 'transfer'

const METHODS = [
    { id: 'cash' as Method, icon: Banknote, label: 'Efectivo', color: '#34d399' },
    { id: 'card' as Method, icon: CreditCard, label: 'Tarjeta', color: '#60a5fa' },
    { id: 'sinpe' as Method, icon: Smartphone, label: 'SINPE Móvil', color: '#f5a623' },
    { id: 'transfer' as Method, icon: ArrowLeftRight, label: 'Transferencia', color: '#a78bfa' },
]

interface PaymentModalProps {
    total: number
    onClose: () => void
    onConfirm: (method: string, ref?: string) => Promise<any>
    isLoading?: boolean
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PaymentModal({
    total, onClose, onConfirm, isLoading = false
}: PaymentModalProps) {
    const { format } = useCurrency()
    const [method, setMethod] = useState<Method>('cash')
    const [received, setReceived] = useState('')
    const [sinpeRef, setSinpeRef] = useState('')
    const [done, setDone] = useState(false)
    const [saleData, setSaleData] = useState<any>(null)

    const receivedNum = parseFloat(received) || 0
    const change = method === 'cash' ? Math.max(0, receivedNum - total) : 0
    const canConfirm =
        (method === 'cash' && receivedNum >= total) ||
        (method !== 'cash')

    const handleMethodChange = (m: Method) => {
        setMethod(m)
        setReceived('')
        setSinpeRef('')
    }

    const handleConfirm = async () => {
        try {
            const sale = await onConfirm(
                method,
                method === 'sinpe' ? sinpeRef : undefined
            )
            setSaleData(sale)
            setDone(true)
        } catch {
            // el error ya lo maneja el padre con toast
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
            <div className="card animate-pop" style={{ width: 420, maxWidth: '95vw', overflow: 'hidden' }}>

                {/* ── Success state ─────────────────────────────────────────────────── */}
                {done ? (
                    <SuccessState
                        sale={saleData}
                        method={method}
                        change={change}
                        sinpeRef={sinpeRef}
                        onClose={onClose}
                    />
                ) : (
                    <>
                        {/* ── Header ──────────────────────────────────────────────────── */}
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '16px' }}>Procesar pago</div>
                                <div style={{
                                    fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px',
                                    fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginTop: '2px',
                                }}>
                                    {format(total)}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="btn-ghost"
                                style={{ padding: '8px', opacity: isLoading ? 0.4 : 1 }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ padding: '20px 24px' }}>

                            {/* ── Selector de método ──────────────────────────────────── */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr',
                                gap: '8px', marginBottom: '20px',
                            }}>
                                {METHODS.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => handleMethodChange(m.id)}
                                        disabled={isLoading}
                                        style={{
                                            padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                            background: method === m.id ? 'var(--bg-overlay)' : 'transparent',
                                            border: method === m.id
                                                ? `1px solid ${m.color}50`
                                                : '1px solid var(--border)',
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            transition: 'all 0.15s',
                                            opacity: isLoading ? 0.5 : 1,
                                        }}
                                    >
                                        <m.icon
                                            size={16}
                                            color={method === m.id ? m.color : 'var(--text-muted)'}
                                        />
                                        <span style={{
                                            fontSize: '13px', fontWeight: 500,
                                            color: method === m.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        }}>
                                            {m.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* ── Campo efectivo ───────────────────────────────────────── */}
                            {method === 'cash' && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        fontSize: '12px', color: 'var(--text-secondary)',
                                        display: 'block', marginBottom: '6px',
                                    }}>
                                        Monto recibido
                                    </label>
                                    <input
                                        type="number"
                                        autoFocus
                                        min="0"
                                        placeholder="0"
                                        value={received}
                                        onChange={e => setReceived(e.target.value)}
                                        disabled={isLoading}
                                        className="input-base"
                                        style={{
                                            width: '100%', padding: '12px 14px',
                                            fontSize: '22px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                                        }}
                                    />

                                    {/* Cambio / faltante */}
                                    {receivedNum > 0 && (
                                        <div style={{
                                            marginTop: '10px', padding: '10px 14px',
                                            borderRadius: 'var(--radius-md)', transition: 'all 0.2s',
                                            background: change >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                                            display: 'flex', justifyContent: 'space-between', fontSize: '14px',
                                        }}>
                                            <span style={{ color: change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                                {change >= 0 ? 'Cambio' : 'Faltante'}
                                            </span>
                                            <span style={{
                                                fontWeight: 700, fontFamily: 'var(--font-mono)',
                                                color: change >= 0 ? 'var(--success)' : 'var(--danger)',
                                            }}>
                                                {format(Math.abs(change))}
                                            </span>
                                        </div>
                                    )}

                                    {/* Atajos de billetes */}
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                                        {[1000, 2000, 5000, 10000, 20000, 50000].map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setReceived(String(v))}
                                                disabled={isLoading}
                                                className="btn-ghost"
                                                style={{
                                                    padding: '5px 10px', fontSize: '11px',
                                                    fontFamily: 'var(--font-mono)',
                                                    background: received === String(v) ? 'var(--accent-bg)' : undefined,
                                                    borderColor: received === String(v) ? 'var(--accent-border)' : undefined,
                                                    color: received === String(v) ? 'var(--accent)' : undefined,
                                                }}
                                            >
                                                {format(v)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Campo SINPE ──────────────────────────────────────────── */}
                            {method === 'sinpe' && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        fontSize: '12px', color: 'var(--text-secondary)',
                                        display: 'block', marginBottom: '6px',
                                    }}>
                                        Número de confirmación SINPE
                                    </label>
                                    <input
                                        autoFocus
                                        placeholder="Ej: 1234567890"
                                        value={sinpeRef}
                                        onChange={e => setSinpeRef(e.target.value)}
                                        disabled={isLoading}
                                        className="input-base"
                                        style={{
                                            width: '100%', padding: '10px 14px',
                                            fontSize: '15px', fontFamily: 'var(--font-mono)',
                                        }}
                                    />
                                    <div style={{
                                        marginTop: '8px', padding: '10px 12px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                                        fontSize: '11px', color: 'var(--text-secondary)',
                                        display: 'flex', gap: '6px', alignItems: 'flex-start',
                                    }}>
                                        <Smartphone size={12} color="var(--accent)" style={{ flexShrink: 0, marginTop: '1px' }} />
                                        Confirmá el recibo en tu teléfono antes de proceder.
                                        El número aparece en el mensaje de SINPE.
                                    </div>
                                </div>
                            )}

                            {/* ── Tarjeta ──────────────────────────────────────────────── */}
                            {method === 'card' && (
                                <div style={{
                                    marginBottom: '16px', padding: '14px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--info-bg)',
                                    border: '1px solid rgba(96,165,250,0.2)',
                                    fontSize: '12px', color: 'var(--text-secondary)',
                                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                                }}>
                                    <CreditCard size={14} color="var(--info)" style={{ flexShrink: 0, marginTop: '1px' }} />
                                    Procesá el pago en la terminal y luego confirmá acá para registrar la venta.
                                </div>
                            )}

                            {/* ── Transferencia ────────────────────────────────────────── */}
                            {method === 'transfer' && (
                                <div style={{
                                    marginBottom: '16px', padding: '14px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                                    fontSize: '12px', color: 'var(--text-secondary)',
                                    display: 'flex', flexDirection: 'column', gap: '6px',
                                }}>
                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                        Datos para transferencia
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>IBAN</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                                            CR04 0152 0200 1026 2840 66
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Monto</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
                                            {format(total)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* ── Botón confirmar ──────────────────────────────────────── */}
                            <button
                                className="btn-accent"
                                disabled={!canConfirm || isLoading}
                                onClick={handleConfirm}
                                style={{
                                    width: '100%', padding: '14px', fontSize: '15px',
                                    opacity: (!canConfirm || isLoading) ? 0.4 : 1,
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px',
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                                        Procesando...
                                    </>
                                ) : (
                                    `Confirmar pago · ${format(total)}`
                                )}
                            </button>

                            {/* Subtexto */}
                            <p style={{
                                textAlign: 'center', fontSize: '11px',
                                color: 'var(--text-muted)', marginTop: '10px',
                            }}>
                                {method === 'cash'
                                    ? receivedNum >= total && change > 0
                                        ? `Dar cambio de ${format(change)}`
                                        : 'Ingresá el monto recibido'
                                    : 'Esta acción registrará la venta en el sistema'
                                }
                            </p>
                        </div>
                    </>
                )}
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
        </div>
    )
}

// ─── SuccessState ─────────────────────────────────────────────────────────────
function SuccessState({ sale, method, change, sinpeRef, onClose }: {
    sale: any
    method: string
    change: number
    sinpeRef: string
    onClose: () => void
}) {
    const { data: tenant } = useTenant()
    const [printing, setPrinting] = useState(false)

    const handlePrint = async () => {
        if (!tenant || !sale) return
        setPrinting(true)
        try {
            const blob = await pdf(
                <ReceiptPDF sale={sale} tenant={tenant} />
            ).toBlob()
            const url = URL.createObjectURL(blob)
            const win = window.open(url, '_blank')
            win?.print()
            setTimeout(() => URL.revokeObjectURL(url), 10000)
        } finally {
            setPrinting(false)
        }
    }

    return (
        <div style={{
            padding: '40px 32px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
        }}>

            {/* Ícono de éxito */}
            <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--success-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <CheckCircle size={32} color="var(--success)" />
            </div>

            {/* Título */}
            <div>
                <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
                    ¡Venta completada!
                </div>
                {sale?.receiptNumber && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Recibo <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            #{sale.receiptNumber}
                        </span>
                    </div>
                )}
            </div>

            {/* Cambio en efectivo */}
            {method === 'cash' && change > 0 && (
                <div style={{
                    padding: '12px 24px', borderRadius: 'var(--radius-md)',
                    background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.3)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                }}>
                    <span style={{ fontSize: '12px', color: 'var(--success)' }}>Cambio a entregar</span>
                    <span style={{
                        fontSize: '24px', fontWeight: 700,
                        fontFamily: 'var(--font-mono)', color: 'var(--success)',
                    }}>
                        {format(change)}
                    </span>
                </div>
            )}

            {/* Referencia SINPE */}
            {method === 'sinpe' && sinpeRef && (
                <div style={{
                    padding: '10px 16px', borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                    fontSize: '12px', color: 'var(--text-secondary)',
                }}>
                    Ref. SINPE: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {sinpeRef}
                    </span>
                </div>
            )}

            {/* Confirmaciones por método */}
            {method === 'card' && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pago con tarjeta procesado</p>}
            {method === 'transfer' && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Transferencia registrada</p>}
            {method === 'cash' && change === 0 && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pago exacto en efectivo</p>}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>

                {/* Imprimir */}
                {tenant && sale && (
                    <button
                        onClick={handlePrint}
                        disabled={printing}
                        className="btn-ghost"
                        style={{
                            flex: 1, padding: '11px', fontSize: '13px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                    >
                        {printing ? (
                            <><Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Preparando...</>
                        ) : (
                            <>🖨️ Imprimir</>
                        )}
                    </button>
                )}

                {/* Descargar PDF */}
                {tenant && sale && (
                    <PDFDownloadLink
                        document={<ReceiptPDF sale={sale} tenant={tenant} />}
                        fileName={`recibo-${sale?.receiptNumber ?? 'comprobante'}.pdf`}
                        style={{ flex: 1, textDecoration: 'none' }}
                    >
                        {({ loading }) => (
                            <button
                                className="btn-ghost"
                                style={{
                                    width: '100%', padding: '11px', fontSize: '13px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                }}
                            >
                                {loading ? (
                                    <><Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Generando...</>
                                ) : (
                                    <>📄 Descargar PDF</>
                                )}
                            </button>
                        )}
                    </PDFDownloadLink>
                )}

                {/* Nueva venta */}
                <button
                    onClick={onClose}
                    className="btn-accent"
                    style={{
                        flex: 1, padding: '11px', fontSize: '13px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    Nueva venta
                </button>
            </div>
        </div>
    )
}