import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException } from '@nestjs/common'
import { CashService, OpenRegisterDto, CloseRegisterDto } from './cash.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser }  from '../auth/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('cash-register')
export class CashController {
  constructor(private cash: CashService) {}

  @Post('open')
  open(@CurrentUser() u: any, @Body() dto: OpenRegisterDto) {
    if (!u.branchId) throw new BadRequestException('Tu usuario no tiene sucursal asignada')
    return this.cash.open(u.branchId, u.id, dto)
  }

  @Post(':id/close')
  close(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: CloseRegisterDto) {
    if (!u.branchId) throw new BadRequestException('Tu usuario no tiene sucursal asignada')
    return this.cash.close(u.branchId, id, dto)
  }

  @Get('current')
  getCurrent(@CurrentUser() u: any) {
    if (!u.branchId) return null
    return this.cash.getCurrent(u.branchId)
  }

  @Get('history')
  getHistory(@CurrentUser() u: any) {
    if (!u.branchId) return []
    return this.cash.getHistory(u.branchId)
  }

  @Get(':id/summary')
  getSummary(@CurrentUser() u: any, @Param('id') id: string) {
    if (!u.branchId) throw new BadRequestException('Tu usuario no tiene sucursal asignada')
    return this.cash.getSummary(id, u.branchId)
  }
}
