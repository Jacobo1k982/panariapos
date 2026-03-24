'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import TrialBanner from '@/components/layout/TrialBanner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user } = useAuthStore()

    useEffect(() => {
        if (user?.role === 'SUPER_ADMIN') {
            router.replace('/admin')
        }
    }, [user, router])

    if (!user) return null

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TrialBanner />
                <Header />
                <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-base)' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}