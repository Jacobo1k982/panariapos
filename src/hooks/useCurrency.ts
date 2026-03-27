'use client'
import { useAuthStore }            from '@/store/auth.store'
import { formatMoney, formatMoneyShort, CURRENCIES, CurrencyConfig } from '@/lib/utils'

/**
 * Hook que expone la moneda del tenant actual y funciones de formateo.
 * Uso: const { format, currency } = useCurrency()
 */
export function useCurrency() {
    const { user } = useAuthStore()
    const currencyCode = (user as any)?.currency ?? 'CRC'
    const currency: CurrencyConfig = CURRENCIES[currencyCode] ?? CURRENCIES.CRC

    return {
        /** Código ISO de la moneda (ej: 'CRC', 'USD') */
        code: currencyCode as string,

        /** Configuración completa de la moneda */
        currency,

        /** Símbolo de la moneda (ej: '₡', '$') */
        symbol: currency.symbol,

        /** Formatea un monto con la moneda del tenant */
        format: (amount: number) => formatMoney(amount, currencyCode),

        /** Formato corto: símbolo + número */
        formatShort: (amount: number) => formatMoneyShort(amount, currencyCode),
    }
}
