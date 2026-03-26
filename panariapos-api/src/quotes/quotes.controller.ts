import {
    Controller, Get, Post, Patch, Body,
    Param, Query, UseGuards,
} from '@nestjs/common'
import { QuotesService }                from './quotes.service'
import { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto'
import { JwtAuthGuard }                 from '../auth/guards/jwt.guard'
import { CurrentUser }                  from '../auth/decorators/current-user.decorator'
import { IsString } from 'class-validator'

class ConvertQuoteDto {
    @IsString() cashRegisterId: string
    @IsString() paymentMethod:  string
}

@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
    constructor(private quotes: QuotesService) {}

    @Post()
    create(@CurrentUser() u: any, @Body() dto: CreateQuoteDto) {
        return this.quotes.create(u.tenantId, u.id, dto)
    }

    @Get()
    findAll(
        @CurrentUser() u: any,
        @Query('status')     status?: string,
        @Query('customerId') customerId?: string,
        @Query('search')     search?: string,
    ) {
        return this.quotes.findAll(u.tenantId, { status, customerId, search })
    }

    @Get(':id')
    findOne(@CurrentUser() u: any, @Param('id') id: string) {
        return this.quotes.findOne(u.tenantId, id)
    }

    @Patch(':id')
    update(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: UpdateQuoteDto) {
        return this.quotes.update(u.tenantId, id, dto)
    }

    @Post(':id/convert')
    convertToSale(
        @CurrentUser() u: any,
        @Param('id') id: string,
        @Body() dto: ConvertQuoteDto,
    ) {
        return this.quotes.convertToSale(u.tenantId, id, dto.cashRegisterId, dto.paymentMethod)
    }
}
