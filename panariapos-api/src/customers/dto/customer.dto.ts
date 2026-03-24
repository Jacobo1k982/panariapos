import {
    IsEmail, IsEnum, IsNumber, IsOptional,
    IsString, Min
} from 'class-validator'
import { CustomerStatus } from '@prisma/client'

export class CreateCustomerDto {
    @IsString() name: string
    @IsString() phone: string
    @IsOptional() @IsEmail() email?: string
    @IsOptional() @IsNumber() @Min(0) creditLimit?: number
    @IsOptional() @IsString() notes?: string
}

export class UpdateCustomerDto {
    @IsOptional() @IsString() name?: string
    @IsOptional() @IsString() phone?: string
    @IsOptional() @IsEmail() email?: string
    @IsOptional() @IsEnum(CustomerStatus) status?: CustomerStatus
    @IsOptional() @IsNumber() creditLimit?: number
    @IsOptional() @IsString() notes?: string
}

export class CreditTransactionDto {
    @IsNumber() @Min(0.01) amount: number
    @IsOptional() @IsString() note?: string
}