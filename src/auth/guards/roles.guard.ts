import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      'roles',
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    // Si el endpoint no tiene @Roles(), no se restringe por rol
    if (!requiredRoles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'No se encontró información del usuario',
      );
    }

    const userRole = user.role.name;

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta acción',
      );
    }

    return true;
  }
}