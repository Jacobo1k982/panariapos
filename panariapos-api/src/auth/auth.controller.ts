import { Controller, Post, Body, UseGuards, Request, HttpCode } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guards/local.guard'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'

@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(200)
    async login(@Request() req: any) {
        return this.auth.login(req.user)
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Body() dto: RefreshDto) {
        return this.auth.refresh(dto.refreshToken)
    }

    @Post('logout')
    @HttpCode(200)
    async logout(@Body() dto: RefreshDto) {
        return this.auth.logout(dto.refreshToken)
    }
}