'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, DollarSign, Menu } from 'lucide-react'
import { useCurrentRegister } from '@/hooks/useCash'
import { useAuthStore } from '@/store/auth.store'
import CloseCashRegisterModal from '@/components/pos/CloseCashRegisterModal'

const TITLES: Record<string, string> = {
    '/pos':        'Punto de Venta',
    '/products':   'Productos',
    '/sales':      'Ventas',
    '/inventory':  'Inventario',
    '/production': 'Producción',
    '/customers':  'Clientes',
    '/suppliers':  'Proveedores',
    '/reports':    'Reportes',
    '/settings':   'Configuración',
}

export default function Header() {
    const path  = usePathname()
    const title = TITLES[path] ?? 'PanariaPOS'
    const now   = new Date().toLocaleDateString('es-CR', {
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
                padding: '0 16px',
                flexShrink: 0,
                gap: '12px',
            }}>

                {/* Título */}
                <div style={{ minWidth: 0 }}>
                    <h1 style={{
                        fontSize: '15px', fontWeight: 700,
                        letterSpacing: '-0.02em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {title}
                    </h1>
                    <p style={{
                        fontSize: '10px', color: 'var(--text-muted)',
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {now}
                    </p>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

                    {/* Indicador caja — solo desktop */}
                    {register && (
                        <button
                            onClick={() => setShowClose(true)}
                            className="hide-mobile"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                background: 'var(--success-bg)',
                                border: '1px solid rgba(52,211,153,0.22)',
                                borderRadius: 'var(--radius-md)',
                                padding: '5px 11px',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLButtonElement
                                el.style.background = 'var(--danger-bg)'
                                el.style.borderColor = 'rgba(248,113,113,0.22)'
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLButtonElement
                                el.style.background = 'var(--success-bg)'
                                el.style.borderColor = 'rgba(52,211,153,0.22)'
                            }}
                        >
                            <DollarSign size={12} color="var(--success)" />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)', lineHeight: 1.2 }}>Caja abierta</div>
                                <div style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: 1.2 }}>Click para cerrar</div>
                            </div>
                        </button>
                    )}

                    {/* Indicador caja — solo móvil (ícono compacto) */}
                    {register && (
                        <button
                            onClick={() => setShowClose(true)}
                            className="hide-desktop"
                            style={{
                                background: 'var(--success-bg)',
                                border: '1px solid rgba(52,211,153,0.22)',
                                borderRadius: 'var(--radius-md)',
                                padding: '7px',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                            }}
                        >
                            <DollarSign size={15} color="var(--success)" />
                        </button>
                    )}

                    {/* Notificaciones */}
                    <button style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '7px',
                        cursor: 'pointer', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center',
                        transition: 'background 0.15s, border-color 0.15s',
                    }}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLButtonElement
                            el.style.background = 'var(--bg-overlay)'
                            el.style.borderColor = 'var(--border-hover)'
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLButtonElement
                            el.style.background = 'none'
                            el.style.borderColor = 'var(--border)'
                        }}
                    >
                        <Bell size={15} />
                    </button>

                    {/* Usuario — solo desktop */}
                    <div
                        className="hide-mobile"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '5px 11px',
                        }}
                    >
                        <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--accent-bg)',
                            border: '1.5px solid var(--accent-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
                            flexShrink: 0,
                        }}>
                            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {user?.name ?? 'Usuario'}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {user?.branchName ?? 'Sucursal'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {showClose && register && (
                <CloseCashRegisterModal
                    registerId={register.id}
                    onClose={() => setShowClose(false)}
                    onClosed={() => { setShowClose(false); window.location.reload() }}
                />
            )}
        </>
    )
}
