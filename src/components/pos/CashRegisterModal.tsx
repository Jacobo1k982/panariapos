'use client'
import { useState } from 'react'
import { X, DollarSign, CheckCircle } from 'lucide-react'
import { useOpenRegister } from '@/hooks/useCash'
import { formatCRC } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CashRegisterModal({ onClose }: { onClose: () => void }) {
    const [amount, setAmount] = useState('')
    const [done, setDone] = useState(false)
    const openRegister = useOpenRegister()

    const handleOpen = async () => {
        try {
            await openRegister.mutateAsync({ openingAmount: parseFloat(amount) || 0 })
            setDone(true)
            setTimeout(onClose, 1400)
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Error al abrir la caja')
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100,
        }}>
            <div className="card animate-pop" style={{ width: 360, padding: '28px' }}>
                {done ? (
                    <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={28} color="var(--success)" />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '16px' }}>¡Caja abierta!</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Monto inicial: {formatCRC(parseFloat(amount) || 0)}</div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '16px' }}>Abrir caja</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Ingresá el monto inicial en efectivo</div>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={16} />
                            </button>
                        </div>

                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                            Efectivo en caja al abrir
                        </label>
                        <input
                            autoFocus type="number" min="0"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0"
                            className="input-base"
                            style={{ width: '100%', padding: '12px 14px', fontSize: '22px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '10px' }}
                        />

                        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
                            {[0, 5000, 10000, 20000, 50000].map(v => (
                                <button key={v} onClick={() => setAmount(String(v))} className="btn-ghost"
                                    style={{ padding: '5px 10px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                                    {v === 0 ? 'Sin fondo' : formatCRC(v)}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '11px' }}>Cancelar</button>
                            <button onClick={handleOpen} className="btn-accent"
                                disabled={openRegister.isPending}
                                style={{ flex: 2, padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <DollarSign size={15} /> Abrir caja
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}