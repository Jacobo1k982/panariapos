import {
    IsString, IsOptional, IsNumber, IsUUID,
    IsEnum, IsDateString, Min, ValidateNested, IsArray,
} from 'class-validator'
import { Type } from 'class-transformer'
import { QuoteStatus } from '@prisma/client'

export class QuoteLineDto {
    @IsUUID()
    productId: string

    @IsString()
    productName: string

    @IsNumber()
    @Min(0.001)
    quantity: number

    @IsNumber()
    @Min(0)
    unitPrice: number

    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number
}

export class CreateQuoteDto {
    @IsOptional()
    @IsUUID()
    customerId?: string

    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number

    @IsOptional()
    @IsString()
    notes?: string

    @IsOptional()
    @IsDateString()
    validUntil?: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuoteLineDto)
    lines: QuoteLineDto[]
}

export class UpdateQuoteDto {
    @IsOptional()
    @IsEnum(QuoteStatus)
    status?: QuoteStatus

    @IsOptional()
    @IsUUID()
    customerId?: string

    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number

    @IsOptional()
    @IsString()
    notes?: string

    @IsOptional()
    @IsDateString()
    validUntil?: string
}
