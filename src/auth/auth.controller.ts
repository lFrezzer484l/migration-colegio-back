import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Throttle({
    short: {
      limit: 5,
      ttl: 60000,
    },
  })

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
  )
  {
    return this.authService.login(loginDto, request);
  }
  
  @Get("profile")
  profile(@Req() request: Request) {
    return this.authService.profile(request);
  }

  @Post('logout')
  logout(@Req() request: Request) {
      return this.authService.logout(request);
  }
}
