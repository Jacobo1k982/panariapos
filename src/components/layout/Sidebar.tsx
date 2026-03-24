'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useCurrentRegister } from '@/hooks/useCash'
import {
    ShoppingCart, Package, ChefHat, Users,
    Truck, BarChart3, Settings, Zap,
    ShoppingBag, LogOut, DollarSign,
} from 'lucide-react'
import CashRegisterModal from '@/components/pos/CashRegisterModal'
import CloseCashRegisterModal from '@/components/pos/CloseCashRegisterModal'

const NAV = [
    { href: '/pos', icon: ShoppingCart, label: 'POS' },
    { href: '/sales', icon: ShoppingBag, label: 'Ventas' },
    { href: '/inventory', icon: Package, label: 'Inventario' },
    { href: '/production', icon: ChefHat, label: 'Producción' },
    { href: '/customers', icon: Users, label: 'Clientes' },
    { href: '/suppliers', icon: Truck, label: 'Proveeds' },
    { href: '/reports', icon: BarChart3, label: 'Reportes' },
    { href: '/settings', icon: Settings, label: 'Config' },
]

export default function Sidebar() {
    const path = usePathname()
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const { data: register } = useCurrentRegister()
    const [showOpen, setShowOpen] = useState(false)
    const [showClose, setShowClose] = useState(false)

    const handleLogout = async () => {
        await logout()
        document.cookie = 'access_token=; path=/; max-age=0'
        router.push('/login')
    }

    const isOpen = !!register

    return (
        <>
            <aside style={{
                width: 'var(--sidebar-w)',
                height: '100vh',
                background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 0',
                flexShrink: 0,
            }}>

                {/* Logo */}
                <div style={{
                    width: 36, height: 36,
                    background: 'var(--accent)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '14px', flexShrink: 0,
                }}>
                    <Zap size={18} color="#0f1117" strokeWidth={2.5} />
                </div>

                {/* Nav links */}
                <div style={{
                    flex: 1, width: '100%', padding: '0 7px',
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    overflowY: 'auto',
                }}>
                    {NAV.map(({ href, icon: Icon, label }) => {
                        const active = path.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`sidebar-nav-item${active ? ' active' : ''}`}
                            >
                                <Icon
                                    size={17}
                                    color={active ? 'var(--accent)' : 'var(--text-muted)'}
                                    strokeWidth={active ? 2.2 : 1.8}
                                />
                                <span style={{
                                    fontSize: '9px', fontWeight: 500, letterSpacing: '0.3px',
                                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                                }}>
                                    {label}
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {/* Footer */}
                <div style={{
                    width: '100%', padding: '8px 7px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', gap: '3px',
                    marginTop: '6px', flexShrink: 0,
                }}>

                    {/* Botón caja */}
                    <button
                        title={isOpen ? 'Caja abierta — click para cerrar' : 'Abrir caja'}
                        onClick={() => isOpen ? setShowClose(true) : setShowOpen(true)}
                        className={`sidebar-btn${isOpen ? ' cash-open' : ''}`}
                    >
                        <DollarSign
                            size={17}
                            color={isOpen ? 'var(--success)' : 'var(--text-muted)'}
                        />
                        <span style={{
                            fontSize: '9px', fontWeight: 600, letterSpacing: '0.3px',
                            color: isOpen ? 'var(--success)' : 'var(--text-muted)',
                        }}>
                            {isOpen ? '● Caja' : 'Caja'}
                        </span>
                    </button>

                    {/* Avatar */}
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '3px',
                        padding: '6px 4px',
                    }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--accent-bg)',
                            border: '1px solid var(--accent-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
                            flexShrink: 0,
                        }}>
                            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                        <span style={{
                            fontSize: '9px', color: 'var(--text-muted)',
                            maxWidth: '56px', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            textAlign: 'center',
                        }}>
                            {user?.name?.split(' ')[0] ?? 'Usuario'}
                        </span>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        title="Cerrar sesión"
                        className="sidebar-btn logout"
                    >
                        <LogOut size={16} color="var(--text-muted)" />
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
                            Salir
                        </span>
                    </button>

                </div>
            </aside>

            {/* Modal abrir caja */}
            {showOpen && (
                <CashRegisterModal onClose={() => setShowOpen(false)} />
            )}

            {/* Modal cerrar caja */}
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