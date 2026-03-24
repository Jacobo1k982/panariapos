import {
    IsBoolean, IsEnum, IsNumber, IsOptional,
    IsString, IsUUID, Min
} from 'class-validator'
import { Unit } from '@prisma/client'

export class CreateProductDto {
    @IsString()
    name: string

    @IsString()
    sku: string

    @IsOptional()
    @IsString()
    description?: string

    @IsNumber()
    @Min(0)
    price: number

    @IsEnum(Unit)
    unit: Unit

    @IsOptional()
    @IsUUID()
    categoryId?: string

    @IsOptional()
    @IsBoolean()
    isProduced?: boolean
}

export class UpdateProductDto {
    @IsOptional() @IsString() name?: string
    @IsOptional() @IsNumber() price?: number
    @IsOptional() @IsEnum(Unit) unit?: Unit
    @IsOptional() @IsUUID() categoryId?: string
    @IsOptional() @IsBoolean() isProduced?: boolean
    @IsOptional() @IsBoolean() active?: boolean
}

export class CreateCategoryDto {
    @IsString() name: string
    @IsOptional() @IsString() emoji?: string
}