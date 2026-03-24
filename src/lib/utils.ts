import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Formatea número a colones costarricenses */
export function formatCRC(amount: number): string {
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/** Formatea fecha en español */
export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('es-CR', {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...opts,
    }).format(new Date(date))
}