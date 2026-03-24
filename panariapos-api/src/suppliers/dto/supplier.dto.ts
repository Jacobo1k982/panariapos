import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { Unit, PurchaseStatus } from '@prisma/client'

export class CreateSupplierDto {
  @IsString() name: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsString() email?: string
  @IsOptional() @IsString() notes?: string
}

export class UpdateSupplierDto {
  @IsOptional() @IsString() name?:  string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsString() email?: string
  @IsOptional() @IsString() notes?: string
}

export class PurchaseLineDto {
  @IsString()  itemName: string
  @IsNumber() @Min(0.001) quantity: number
  @IsEnum(Unit) unit: Unit
  @IsNumber() @Min(0) cost: number
}

export class CreatePurchaseOrderDto {
  @IsUUID() supplierId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseLineDto)
  lines: PurchaseLineDto[]

  @IsOptional() @IsString() notes?: string
}

export class UpdatePurchaseOrderDto {
  @IsOptional() @IsEnum(PurchaseStatus) status?: PurchaseStatus
  @IsOptional() @IsString() notes?: string
}
