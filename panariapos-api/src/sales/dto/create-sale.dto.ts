import {
    IsEnum, IsOptional, IsString, IsUUID, IsArray,
    ValidateNested, IsNumber, Min
} from 'class-validator'
import { Type } from 'class-transformer'
import { PaymentMethod } from '@prisma/client'

export class SaleLineDto {
    @IsUUID()
    productId: string

    @IsNumber()
    @Min(0.001)
    quantity: number

    @IsNumber()
    @Min(0)
    unitPrice: number

    @IsNumber()
    @Min(0)
    discount: number
}

export class CreateSaleDto {
    @IsOptional()
    @IsUUID()
    customerId?: string

    @IsOptional()
    @IsUUID()
    cashRegisterId?: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SaleLineDto)
    lines: SaleLineDto[]

    @IsNumber()
    @Min(0)
    discount: number    // descuento global %

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod

    @IsOptional()
    @IsString()
    paymentRef?: string   // referencia SINPE

    @IsOptional()
    @IsString()
    notes?: string
}