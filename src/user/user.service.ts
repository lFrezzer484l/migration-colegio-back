import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';

import {
  ChangePasswordDto,
} from './dto/change-password.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}


  // ==========================================
  // OBTENER ADMINISTRADORES
  // ==========================================

  async findAdmins() {

    const admins =
      await this.userRepository.find({
        where: {
          role: {
            name: 'admin',
          },
        },

        relations: {
          role: true,
        },

        order: {
          firstName: 'ASC',
          lastName: 'ASC',
        },
      });

    return admins.map((admin) => ({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
    }));
  }


  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ) {

    const user =
      await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }


    // ========================================
    // VERIFICAR CONTRASEÑA ACTUAL
    // ========================================

    const isCurrentPasswordValid =
      await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException(
        'La contraseña actual es incorrecta',
      );
    }


    // ========================================
    // EVITAR MISMA CONTRASEÑA
    // ========================================

    const isSamePassword =
      await bcrypt.compare(
        changePasswordDto.newPassword,
        user.password,
      );

    if (isSamePassword) {
      throw new ForbiddenException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }


    // ========================================
    // GENERAR NUEVO HASH
    // ========================================

    const hashedPassword =
      await bcrypt.hash(
        changePasswordDto.newPassword,
        10,
      );


    // ========================================
    // ACTUALIZAR CONTRASEÑA
    // ========================================

    user.password = hashedPassword;

    await this.userRepository.save(user);


    return {
      message:
        'Contraseña actualizada correctamente',
    };
  }
}