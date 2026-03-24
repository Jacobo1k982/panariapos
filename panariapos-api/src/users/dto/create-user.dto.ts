import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator'
import { Role } from '@prisma/client'

export class CreateUserDto {
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsEnum(Role)
  role: Role

  @IsOptional()
  @IsUUID()
  branchId?: string
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEnum(Role)
  role?: Role

  @IsOptional()
  @IsUUID()
  branchId?: string

  @IsOptional()
  active?: boolean
}
