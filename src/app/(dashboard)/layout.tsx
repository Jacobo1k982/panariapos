'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import Header from '@/components/layout/Header'
import TrialBanner from '@/components/layout/TrialBanner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user } = useAuthStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        if (user?.role === 'SUPER_ADMIN') router.replace('/admin')
    }, [user, router])

    if (!mounted || !user) return null

    return (
        <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>

            {/* Sidebar — solo desktop */}
            <div className="hide-mobile">
                <Sidebar />
            </div>

            {/* Contenido principal */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                <TrialBanner />
                <Header />
                <main style={{
                    flex: 1,
                    overflow: 'auto',
                    background: 'var(--bg-base)',
                    /* Espacio extra en móvil para la bottom nav */
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}>
                    {children}
                </main>

                {/* Bottom nav — solo móvil */}
                <div className="hide-desktop">
                    <MobileNav />
                </div>
            </div>
        </div>
    )
}
