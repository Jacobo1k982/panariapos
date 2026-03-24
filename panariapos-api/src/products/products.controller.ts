import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards
} from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto, UpdateProductDto, CreateCategoryDto } from './dto/product.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Role } from '@prisma/client'

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
    constructor(private products: ProductsService) { }

    // Categorías
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @Post('categories')
    createCategory(@CurrentUser() u: any, @Body() dto: CreateCategoryDto) {
        return this.products.createCategory(u.tenantId, dto)
    }

    @Get('categories')
    findCategories(@CurrentUser() u: any) {
        return this.products.findCategories(u.tenantId)
    }

    // Productos
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @Post()
    create(@CurrentUser() u: any, @Body() dto: CreateProductDto) {
        return this.products.create(u.tenantId, dto)
    }

    @Get()
    findAll(
        @CurrentUser() u: any,
        @Query('categoryId') categoryId?: string,
        @Query('search') search?: string,
    ) {
        return this.products.findAll(u.tenantId, { categoryId, search })
    }

    @Get(':id')
    findOne(@CurrentUser() u: any, @Param('id') id: string) {
        return this.products.findOne(u.tenantId, id)
    }

    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @Patch(':id')
    update(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.products.update(u.tenantId, id, dto)
    }

    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @Delete(':id')
    remove(@CurrentUser() u: any, @Param('id') id: string) {
        return this.products.remove(u.tenantId, id)
    }
}