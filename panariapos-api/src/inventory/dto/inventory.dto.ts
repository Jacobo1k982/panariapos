import {
    IsEnum, IsNumber, IsOptional, IsString,
    IsDateString, Min
} from 'class-validator'
import { Unit, ItemCategory } from '@prisma/client'

export class CreateInventoryItemDto {
    @IsString() name: string
    @IsString() sku: string
    @IsEnum(ItemCategory) category: ItemCategory
    @IsEnum(Unit) unit: Unit
    @IsNumber() @Min(0) quantity: number
    @IsNumber() @Min(0) minStock: number
    @IsNumber() @Min(0) costPerUnit: number
    @IsOptional() @IsString() supplier?: string
    @IsOptional() @IsDateString() expiryDate?: string
}

export class AdjustInventoryDto {
    @IsNumber() delta: number
    @IsOptional() @IsString() reason?: string
}