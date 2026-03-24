import {
    Controller, Get, Post, Patch, Body,
    Param, Query, UseGuards
} from '@nestjs/common'
import { CustomersService } from './customers.service'
import { CreateCustomerDto, UpdateCustomerDto, CreditTransactionDto } from './dto/customer.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
    constructor(private customers: CustomersService) { }

    @Post()
    create(@CurrentUser() u: any, @Body() dto: CreateCustomerDto) {
        return this.customers.create(u.tenantId, dto)
    }

    @Get()
    findAll(
        @CurrentUser() u: any,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        return this.customers.findAll(u.tenantId, { search, status })
    }

    @Get(':id')
    findOne(@CurrentUser() u: any, @Param('id') id: string) {
        return this.customers.findOne(u.tenantId, id)
    }

    @Patch(':id')
    update(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
        return this.customers.update(u.tenantId, id, dto)
    }

    @Post(':id/charge')
    charge(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: CreditTransactionDto) {
        return this.customers.charge(u.tenantId, id, dto)
    }

    @Post(':id/payment')
    payment(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: CreditTransactionDto) {
        return this.customers.payment(u.tenantId, id, dto)
    }
}