import { PrismaClient, Role, Plan } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando seed...')

    const tenant = await prisma.tenant.upsert({
        where: { slug: 'panaderia-la-central' },
        update: {},
        create: {
            name: 'Panadería La Central',
            slug: 'panaderia-la-central',
            plan: Plan.PRO,
            phone: '2222-3333',
            address: 'San José, Costa Rica',
            receiptMsg: 'Gracias por su compra. ¡Vuelva pronto!',
        },
    })

    const branch = await prisma.branch.upsert({
        where: { id: 'branch-central-001' },
        update: {},
        create: {
            id: 'branch-central-001',
            tenantId: tenant.id,
            name: 'Sucursal Central',
            address: 'Av. Central, San José',
            phone: '2222-3333',
        },
    })

    const hash = await bcrypt.hash('Admin1234!', 12)
    const hashCajero = await bcrypt.hash('Cajero1234!', 12)

    await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: 'admin@lacentral.cr' } },
        update: {},
        create: {
            tenantId: tenant.id,
            branchId: branch.id,
            name: 'Administrador',
            email: 'admin@lacentral.cr',
            passwordHash: hash,
            role: Role.ADMIN,
        },
    })

    await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: 'cajero@lacentral.cr' } },
        update: {},
        create: {
            tenantId: tenant.id,
            branchId: branch.id,
            name: 'Juan Cajero',
            email: 'cajero@lacentral.cr',
            passwordHash: hashCajero,
            role: Role.CASHIER,
        },
    })

    const cats = await Promise.all([
        prisma.category.create({ data: { tenantId: tenant.id, name: 'Pan', emoji: '🍞' } }),
        prisma.category.create({ data: { tenantId: tenant.id, name: 'Repostería', emoji: '🧁' } }),
        prisma.category.create({ data: { tenantId: tenant.id, name: 'Bebidas', emoji: '☕' } }),
    ])

    await prisma.product.createMany({
        data: [
            { tenantId: tenant.id, categoryId: cats[0].id, sku: 'P001', name: 'Pan baguette', price: 850, unit: 'UNIT', isProduced: true },
            { tenantId: tenant.id, categoryId: cats[0].id, sku: 'P002', name: 'Pan integral', price: 1200, unit: 'UNIT', isProduced: true },
            { tenantId: tenant.id, categoryId: cats[1].id, sku: 'P003', name: 'Croissant', price: 950, unit: 'UNIT', isProduced: true },
            { tenantId: tenant.id, categoryId: cats[1].id, sku: 'P004', name: 'Torta chocolate', price: 2800, unit: 'UNIT', isProduced: true },
            { tenantId: tenant.id, categoryId: cats[2].id, sku: 'P005', name: 'Café americano', price: 1500, unit: 'UNIT', isProduced: false },
            { tenantId: tenant.id, categoryId: cats[2].id, sku: 'P006', name: 'Cappuccino', price: 2200, unit: 'UNIT', isProduced: false },
            { tenantId: tenant.id, categoryId: cats[0].id, sku: 'P007', name: 'Pan dulce', price: 600, unit: 'UNIT', isProduced: true },
            { tenantId: tenant.id, categoryId: cats[1].id, sku: 'P008', name: 'Muffin', price: 1200, unit: 'UNIT', isProduced: true },
        ],
        skipDuplicates: true,
    })

    await prisma.inventoryItem.createMany({
        data: [
            { branchId: branch.id, name: 'Harina de trigo', sku: 'MP001', category: 'RAW_MATERIAL', unit: 'KG', quantity: 45, minStock: 20, costPerUnit: 850 },
            { branchId: branch.id, name: 'Azúcar blanca', sku: 'MP002', category: 'RAW_MATERIAL', unit: 'KG', quantity: 12, minStock: 15, costPerUnit: 680 },
            { branchId: branch.id, name: 'Levadura seca', sku: 'MP003', category: 'RAW_MATERIAL', unit: 'G', quantity: 800, minStock: 500, costPerUnit: 12 },
            { branchId: branch.id, name: 'Mantequilla', sku: 'MP004', category: 'RAW_MATERIAL', unit: 'KG', quantity: 8, minStock: 10, costPerUnit: 3200 },
            { branchId: branch.id, name: 'Huevos', sku: 'MP005', category: 'RAW_MATERIAL', unit: 'UNIT', quantity: 144, minStock: 60, costPerUnit: 180 },
            { branchId: branch.id, name: 'Leche entera', sku: 'MP006', category: 'RAW_MATERIAL', unit: 'L', quantity: 5, minStock: 10, costPerUnit: 750 },
        ],
        skipDuplicates: true,
    })

    await prisma.customer.create({
        data: {
            tenantId: tenant.id,
            name: 'María Rodríguez',
            phone: '8888-1234',
            email: 'maria@gmail.com',
            creditLimit: 15000,
            loyaltyPoints: 850,
        },
    }).catch(() => { })

    console.log('✅ Seed completado')
    console.log('📧 Admin:  admin@lacentral.cr / Admin1234!')
    console.log('📧 Cajero: cajero@lacentral.cr / Cajero1234!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())