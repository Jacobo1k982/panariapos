import {
    Document, Page, Text, View, StyleSheet
} from '@react-pdf/renderer'

const S = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 9,
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 20,
        paddingRight: 20,
        width: '80mm',
    },
    center: { textAlign: 'center' },
    bold: { fontFamily: 'Helvetica-Bold' },
    divider: { borderBottom: '1px dashed #999', marginVertical: 6 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    label: { color: '#666' },
    accent: { fontFamily: 'Helvetica-Bold', fontSize: 12 },
    small: { fontSize: 8, color: '#888' },
    mb2: { marginBottom: 2 },
    mb4: { marginBottom: 4 },
    mt4: { marginTop: 4 },
})

interface ReceiptProps {
    sale: {
        receiptNumber: string
        createdAt: string
        paymentMethod: string
        paymentRef?: string
        subtotal: number
        discount: number
        total: number
        lines: {
            productName: string
            quantity: number
            unitPrice: number
            discount: number
            subtotal: number
        }[]
        customer?: { name: string } | null
        user?: { name: string } | null
    }
    tenant: {
        name: string
        phone?: string
        address?: string
        receiptMsg?: string
    }
}

const METHOD_LABEL: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    SINPE: 'SINPE Móvil',
    TRANSFER: 'Transferencia',
    CREDIT: 'Fiado',
}

function fmt(n: number) {
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n)
}

export default function ReceiptPDF({ sale, tenant }: ReceiptProps) {
    const date = new Date(sale.createdAt).toLocaleString('es-CR', {
        dateStyle: 'short',
        timeStyle: 'short',
    })

    return (
        <Document>
            <Page size={[226, 800]} style={S.page}>

                {/* ── Encabezado ── */}
                <View style={[S.center, S.mb4]}>
                    <Text style={[S.bold, { fontSize: 13 }]}>{tenant.name}</Text>
                    {tenant.phone && <Text style={S.small}>{tenant.phone}</Text>}
                    {tenant.address && <Text style={S.small}>{tenant.address}</Text>}
                </View>

                <View style={S.divider} />

                {/* ── Info de la venta ── */}
                <View style={S.mb4}>
                    <View style={S.row}>
                        <Text style={S.label}>Recibo</Text>
                        <Text style={S.bold}>#{sale.receiptNumber}</Text>
                    </View>
                    <View style={S.row}>
                        <Text style={S.label}>Fecha</Text>
                        <Text>{date}</Text>
                    </View>
                    <View style={S.row}>
                        <Text style={S.label}>Cajero</Text>
                        <Text>{sale.user?.name ?? '—'}</Text>
                    </View>
                    {sale.customer && (
                        <View style={S.row}>
                            <Text style={S.label}>Cliente</Text>
                            <Text>{sale.customer.name}</Text>
                        </View>
                    )}
                    <View style={S.row}>
                        <Text style={S.label}>Pago</Text>
                        <Text>{METHOD_LABEL[sale.paymentMethod] ?? sale.paymentMethod}</Text>
                    </View>
                    {sale.paymentRef && (
                        <View style={S.row}>
                            <Text style={S.label}>Ref.</Text>
                            <Text style={S.bold}>{sale.paymentRef}</Text>
                        </View>
                    )}
                </View>

                <View style={S.divider} />

                {/* ── Productos ── */}
                <View style={S.mb4}>
                    {/* Header */}
                    <View style={[S.row, S.mb2]}>
                        <Text style={[S.bold, { flex: 2 }]}>Producto</Text>
                        <Text style={[S.bold, { width: 30, textAlign: 'right' }]}>Cant</Text>
                        <Text style={[S.bold, { width: 50, textAlign: 'right' }]}>Precio</Text>
                        <Text style={[S.bold, { width: 50, textAlign: 'right' }]}>Total</Text>
                    </View>

                    {sale.lines.map((line, i) => (
                        <View key={i} style={S.mb2}>
                            <View style={S.row}>
                                <Text style={{ flex: 2 }}>{line.productName}</Text>
                                <Text style={{ width: 30, textAlign: 'right' }}>
                                    {Number(line.quantity)}
                                </Text>
                                <Text style={{ width: 50, textAlign: 'right' }}>
                                    {fmt(Number(line.unitPrice))}
                                </Text>
                                <Text style={{ width: 50, textAlign: 'right' }}>
                                    {fmt(Number(line.subtotal))}
                                </Text>
                            </View>
                            {Number(line.discount) > 0 && (
                                <Text style={[S.small, { textAlign: 'right' }]}>
                                    Descuento {line.discount}%
                                </Text>
                            )}
                        </View>
                    ))}
                </View>

                <View style={S.divider} />

                {/* ── Totales ── */}
                <View style={S.mb4}>
                    <View style={S.row}>
                        <Text style={S.label}>Subtotal</Text>
                        <Text>{fmt(Number(sale.subtotal))}</Text>
                    </View>
                    {Number(sale.discount) > 0 && (
                        <View style={S.row}>
                            <Text style={S.label}>Descuento ({sale.discount}%)</Text>
                            <Text>−{fmt(Number(sale.subtotal) - Number(sale.total))}</Text>
                        </View>
                    )}
                    <View style={[S.row, S.mt4]}>
                        <Text style={S.accent}>TOTAL</Text>
                        <Text style={S.accent}>{fmt(Number(sale.total))}</Text>
                    </View>
                </View>

                <View style={S.divider} />

                {/* ── Pie ── */}
                <View style={[S.center, S.mt4]}>
                    <Text style={S.small}>
                        {tenant.receiptMsg ?? 'Gracias por su compra'}
                    </Text>
                    <Text style={[S.small, { marginTop: 4 }]}>
                        Régimen simplificado — No genera crédito fiscal
                    </Text>
                </View>

            </Page>
        </Document>
    )
}