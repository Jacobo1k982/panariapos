'use client'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'

export default function TrialBanner() {
    const { user } = useAuthStore()
    const router = useRouter()

    if (!user?.trialEndsAt) return null

    const trialEnd = new Date(user.trialEndsAt)
    const now = new Date()
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // No mostrar si el trial ya venció o quedan más de 15 días
    if (daysLeft <= 0 || daysLeft > 15) return null

    const isUrgent = daysLeft <= 3

    return (
        <div style={{
            background: isUrgent ? 'var(--danger-bg)' : 'var(--accent-bg)',
            borderBottom: `1px solid ${isUrgent ? 'rgba(248,113,113,0.2)' : 'var(--accent-border)'}`,
            padding: '8px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', flexShrink: 0,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock
                    size={14}
                    color={isUrgent ? 'var(--danger)' : 'var(--accent)'}
                />
                <span style={{
                    fontSize: '12px', fontWeight: 500,
                    color: isUrgent ? 'var(--danger)' : 'var(--accent)',
                }}>
                    {isUrgent
                        ? `⚠ Tu período de prueba vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`
                        : `Tu período de prueba gratuita vence en ${daysLeft} días`
                    }
                </span>
            </div>
            <button
                onClick={() => router.push('/settings/plans')}
                style={{
                    padding: '4px 14px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    background: isUrgent ? 'var(--danger)' : 'var(--accent)',
                    color: '#0f1117', border: 'none',
                    whiteSpace: 'nowrap',
                }}
            >
                Elegir plan →
            </button>
        </div>
    )
}