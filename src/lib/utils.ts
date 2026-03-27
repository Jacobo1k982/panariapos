import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// ── Monedas soportadas ────────────────────────────────────────────────────────
export interface CurrencyConfig {
    code:     string   // ISO 4217
    symbol:   string
    name:     string
    locale:   string
    country:  string
    flag:     string
    decimals: number
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
    CRC: { code: 'CRC', symbol: '₡',  name: 'Colón costarricense',    locale: 'es-CR', country: 'Costa Rica',  flag: '🇨🇷', decimals: 0 },
    NIO: { code: 'NIO', symbol: 'C$', name: 'Córdoba nicaragüense',    locale: 'es-NI', country: 'Nicaragua',   flag: '🇳🇮', decimals: 2 },
    USD: { code: 'USD', symbol: '$',  name: 'Dólar estadounidense',    locale: 'en-US', country: 'Estados Unidos', flag: '🇺🇸', decimals: 2 },
    GTQ: { code: 'GTQ', symbol: 'Q',  name: 'Quetzal guatemalteco',    locale: 'es-GT', country: 'Guatemala',   flag: '🇬🇹', decimals: 2 },
    HNL: { code: 'HNL', symbol: 'L',  name: 'Lempira hondureño',       locale: 'es-HN', country: 'Honduras',    flag: '🇭🇳', decimals: 2 },
    SVC: { code: 'SVC', symbol: '₡',  name: 'Colón salvadoreño',       locale: 'es-SV', country: 'El Salvador', flag: '🇸🇻', decimals: 2 },
    BZD: { code: 'BZD', symbol: 'BZ$',name: 'Dólar de Belice',         locale: 'en-BZ', country: 'Belice',      flag: '🇧🇿', decimals: 2 },
    PAB: { code: 'PAB', symbol: 'B/.', name: 'Balboa panameño',        locale: 'es-PA', country: 'Panamá',      flag: '🇵🇦', decimals: 2 },
}

// Detectar moneda por país/timezone
export const TIMEZONE_TO_CURRENCY: Record<string, string> = {
    'America/Costa_Rica':   'CRC',
    'America/Managua':      'NIO',
    'America/Guatemala':    'GTQ',
    'America/Tegucigalpa':  'HNL',
    'America/El_Salvador':  'SVC',
    'America/Belize':       'BZD',
    'America/Panama':       'PAB',
    'America/New_York':     'USD',
    'America/Chicago':      'USD',
    'America/Los_Angeles':  'USD',
}

export function getCurrencyFromTimezone(timezone: string): string {
    return TIMEZONE_TO_CURRENCY[timezone] ?? 'USD'
}

// ── Formateadores ─────────────────────────────────────────────────────────────

/** Formatea un monto con la moneda especificada */
export function formatMoney(amount: number, currencyCode: string = 'CRC'): string {
    const cfg = CURRENCIES[currencyCode]
    if (!cfg) return `${currencyCode} ${amount.toFixed(2)}`

    try {
        return new Intl.NumberFormat(cfg.locale, {
            style:                 'currency',
            currency:              cfg.code,
            minimumFractionDigits: cfg.decimals,
            maximumFractionDigits: cfg.decimals,
        }).format(amount)
    } catch {
        return `${cfg.symbol}${amount.toFixed(cfg.decimals)}`
    }
}

/** Formato corto: solo símbolo + número (sin código ISO) */
export function formatMoneyShort(amount: number, currencyCode: string = 'CRC'): string {
    const cfg = CURRENCIES[currencyCode] ?? CURRENCIES.USD
    const formatted = new Intl.NumberFormat(cfg.locale, {
        minimumFractionDigits: cfg.decimals,
        maximumFractionDigits: cfg.decimals,
    }).format(amount)
    return `${cfg.symbol}${formatted}`
}

/** Backward compatible — usa CRC por defecto */
export function formatCRC(amount: number): string {
    return formatMoney(amount, 'CRC')
}

/** Formatea fecha en español */
export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('es-CR', {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...opts,
    }).format(new Date(date))
}
