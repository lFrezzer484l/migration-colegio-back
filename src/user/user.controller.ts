import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { UserService } from './user.service';

import { SessionGuard } from '../auth/guards/session.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

import {
  ChangePasswordDto,
} from './dto/change-password.dto';

@Controller('users')
@UseGuards(SessionGuard)
export class UserController {

  constructor(
    private readonly userService: UserService,
  ) {}


  // ==========================================
  // OBTENER ADMINISTRADORES
  // ==========================================

  @Get('admins')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAdmins() {
    return this.userService.findAdmins();
  }


  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  @Post('change-password')
  changePassword(
    @Body()
    changePasswordDto: ChangePasswordDto,

    @Req()
    request: Request,
  ) {

    return this.userService.changePassword(
      request.user!.id,
      changePasswordDto,
    );
  }
}