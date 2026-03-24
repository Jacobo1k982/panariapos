'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, DollarSign } from 'lucide-react'
import { useCurrentRegister } from '@/hooks/useCash'
import { useAuthStore } from '@/store/auth.store'
import CloseCashRegisterModal from '@/components/pos/CloseCashRegisterModal'
import { formatCRC } from '@/lib/utils'

const TITLES: Record<string, string> = {
    '/pos': 'Punto de Venta',
    '/sales': 'Historial de Ventas',
    '/inventory': 'Inventario',
    '/production': 'Producción',
    '/customers': 'Clientes',
    '/suppliers': 'Proveedores',
    '/reports': 'Reportes',
    '/settings': 'Configuración',
}

export default function Header() {
    const path = usePathname()
    const title = TITLES[path] ?? 'PanariaPOS'
    const now = new Date().toLocaleDateString('es-CR', {
        weekday: 'long', day: 'numeric', month: 'long',
    })

    const { user } = useAuthStore()
    const { data: register } = useCurrentRegister()
    const [showClose, setShowClose] = useState(false)

    return (
        <>
            <header style={{
                height: 'var(--header-h)',
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                flexShrink: 0,
            }}>
                {/* Título */}
                <div>
                    <h1 style={{ fontSize: '16px', fontWeight: 600 }}>{title}</h1>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {now}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                    {/* Indicador de caja abierta */}
                    {register && (
                        <button
                            onClick={() => setShowClose(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                background: 'var(--success-bg)',
                                border: '1px solid rgba(52,211,153,0.25)',
                                borderRadius: 'var(--radius-md)',
                                padding: '6px 12px', cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLButtonElement
                                el.style.background = 'var(--danger-bg)'
                                el.style.borderColor = 'rgba(248,113,113,0.25)'
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLButtonElement
                                el.style.background = 'var(--success-bg)'
                                el.style.borderColor = 'rgba(52,211,153,0.25)'
                            }}
                        >
                            <DollarSign size={13} color="var(--success)" />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)' }}>
                                    Caja abierta
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                    Click para cerrar
                                </div>
                            </div>
                        </button>
                    )}

                    {/* Notificaciones */}
                    <button style={{
                        background: 'none', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', padding: '7px',
                        cursor: 'pointer', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center',
                    }}>
                        <Bell size={16} />
                    </button>

                    {/* Usuario */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '6px 12px',
                    }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--accent-bg)',
                            border: '1px solid var(--accent-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
                        }}>
                            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 500 }}>
                                {user?.name ?? 'Usuario'}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                {user?.branchName ?? 'Sucursal'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Modal cierre de caja */}
            {showClose && register && (
                <CloseCashRegisterModal
                    registerId={register.id}
                    onClose={() => setShowClose(false)}
                    onClosed={() => {
                        setShowClose(false)
                        window.location.reload()
                    }}
                />
            )}
        </>
    )
}