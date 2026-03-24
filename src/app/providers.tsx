'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                refetchOnWindowFocus: false,
                staleTime: 1000 * 60 * 2, // 2 minutos
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        fontSize: '13px',
                    },
                    success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-elevated)' } },
                    error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-elevated)' } },
                }}
            />
        </QueryClientProvider>
    )
}