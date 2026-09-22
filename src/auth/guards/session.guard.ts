import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Request } from 'express';

import { User } from '../../user/entities/user.entity';

@Injectable()
export class SessionGuard implements CanActivate {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context
      .switchToHttp()
      .getRequest<Request>();

    const userId = request.session.userId;

    if (!userId) {
      throw new UnauthorizedException(
        'No hay una sesión activa',
      );
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    request.user = user;

    return true;
  }
}