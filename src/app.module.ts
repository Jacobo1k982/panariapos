import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { TenantsModule } from './tenants/tenants.module'
import { BranchesModule } from './branches/branches.module'
import { UsersModule } from '../panariapos-api/dist/src/users/users.module'
import { ProductsModule } from './products/products.module'
import { InventoryModule } from './inventory/inventory.module'
import { SalesModule } from './sales/sales.module'
import { CustomersModule } from './customers/customers.module'
import { ProductionModule } from './production/production.module'
import { CashModule } from './cash/cash.module'
import { ReportsModule } from './reports/reports.module'
import { AdminModule } from './admin/admin.module'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        // Rate limiting global — 100 req/min por IP
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),

        PrismaModule,
        AuthModule,
        TenantsModule,
        BranchesModule,
        UsersModule,
        ProductsModule,
        InventoryModule,
        SalesModule,
        CustomersModule,
        ProductionModule,
        CashModule,
        ReportsModule,
        AdminModule,
    ],
})
export class AppModule { }