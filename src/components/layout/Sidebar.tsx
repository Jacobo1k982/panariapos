'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useCurrentRegister } from '@/hooks/useCash'
import {
    ShoppingCart, Package, ChefHat, Users,
    Truck, BarChart3, Settings, Zap,
    ShoppingBag, LogOut, DollarSign, FileText
} from 'lucide-react'
import CashRegisterModal from '@/components/pos/CashRegisterModal'
import CloseCashRegisterModal from '@/components/pos/CloseCashRegisterModal'

const NAV = [
    { href: '/pos', icon: ShoppingCart, label: 'POS' },
    { href: '/products', icon: Package, label: 'Productos' },
    { href: '/sales', icon: ShoppingBag, label: 'Ventas' },
    { href: '/inventory', icon: Package, label: 'Inventario' },
    { href: '/production', icon: ChefHat, label: 'Producción' },
    { href: '/customers', icon: Users, label: 'Clientes' },
    { href: '/suppliers', icon: Truck, label: 'Proveedores' },
    { href: '/reports', icon: BarChart3, label: 'Reportes' },
    { href: '/settings', icon: Settings, label: 'Config' },
    { href: '/quotes', icon: FileText, label: 'Cotizaciones' },
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
                height: '100dvh',
                background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 0',
                flexShrink: 0,
                position: 'sticky',
                top: 0,
            }}>

                {/* Logo */}
                <div style={{
                    width: 38, height: 38,
                    background: 'var(--accent)',
                    borderRadius: '11px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px', flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(245,166,35,0.3)',
                }}>
                    <Zap size={18} color="#0c0e14" strokeWidth={2.5} />
                </div>

                {/* Nav */}
                <nav style={{
                    flex: 1, width: '100%', padding: '0 8px',
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    overflowY: 'auto',
                }}>
                    {NAV.map(({ href, icon: Icon, label }) => {
                        const active = path === href || path.startsWith(href + '/')
                        return (
                            <Link
                                key={href}
                                href={href}
                                title={label}
                                className={`sidebar-nav-item${active ? ' active' : ''}`}
                            >
                                <Icon
                                    size={17}
                                    color={active ? 'var(--accent)' : 'var(--text-muted)'}
                                    strokeWidth={active ? 2.2 : 1.8}
                                />
                                <span style={{
                                    fontSize: '9px', fontWeight: 600,
                                    letterSpacing: '0.2px',
                                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                                }}>
                                    {label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div style={{
                    width: '100%', padding: '8px 8px 0',
                    borderTop: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    marginTop: '8px', flexShrink: 0,
                }}>

                    {/* Caja */}
                    <button
                        title={isOpen ? 'Caja abierta — cerrar' : 'Abrir caja'}
                        onClick={() => isOpen ? setShowClose(true) : setShowOpen(true)}
                        className={`sidebar-btn${isOpen ? ' cash-open' : ''}`}
                    >
                        <DollarSign
                            size={17}
                            color={isOpen ? 'var(--success)' : 'var(--text-muted)'}
                        />
                        <span style={{
                            fontSize: '9px', fontWeight: 600,
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
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'var(--accent-bg)',
                            border: '1.5px solid var(--accent-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 700, color: 'var(--accent)',
                        }}>
                            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                        <span style={{
                            fontSize: '9px', color: 'var(--text-muted)',
                            maxWidth: '52px', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
                        <LogOut size={15} color="var(--text-muted)" />
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Salir</span>
                    </button>
                </div>
            </aside>

            {showOpen && <CashRegisterModal onClose={() => setShowOpen(false)} />}
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
