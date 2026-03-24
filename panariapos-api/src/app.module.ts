import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TenantsModule } from './tenants/tenants.module'
import { BranchesModule } from './branches/branches.module'
import { ProductsModule } from './products/products.module'
import { InventoryModule } from './inventory/inventory.module'
import { SalesModule } from './sales/sales.module'
import { CustomersModule } from './customers/customers.module'
import { CashModule } from './cash/cash.module'
import { ProductionModule } from './production/production.module'
import { ReportsModule } from './reports/reports.module'
import { AdminModule } from './admin/admin.module'
import { SuppliersModule } from './suppliers/suppliers.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    BranchesModule,
    ProductsModule,
    InventoryModule,
    SalesModule,
    CustomersModule,
    CashModule,
    ProductionModule,
    ReportsModule,
    AdminModule,
    SuppliersModule,
  ],
})
export class AppModule { }