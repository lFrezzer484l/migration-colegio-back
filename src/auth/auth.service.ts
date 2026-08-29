import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Person } from 'src/person/entities/person.entity';
import type { Request } from 'express';

@Injectable()
export class AuthService {
    
    constructor(
            @InjectRepository(User)
            private readonly userRepository: Repository<User>,
        ) {}
    async login(loginDto: LoginDto, request: Request) {
        
        const { institutionalEmail, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: {
                institutionalEmail,
            },
            relations: {
                role: true,
                person: true,
            },
        });

        if (!user){
            throw new UnauthorizedException(
                'Credenciales invalidas',
            )
        }
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password,
        );

        if (!isPasswordValid){
            throw new UnauthorizedException(
                'Credenciales invalidas',
            )
        };
        
        request.session.userId = user?.id

        return {
            user: {
                id: user.id,
                institutionalEmail: user.institutionalEmail,
                role: user.role,
                firstName: user.person.firstName,
                lastName: user.person.lastName,
            },
        };

        
    }

    async profile(request: Request){
        
        
        const userId = request.session.userId;
        
        if (!userId) {
            throw new UnauthorizedException('No hay una sesión activa');
        }

        const user = await this.userRepository.findOne({
            where: {
                id: userId,
            },
            relations: {
                role: true,
                person: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        return{
            id: user.id,
            institutionalEmail: user.institutionalEmail,
            role: user.role,
            firstName: user.person.firstName,
            lastName: user.person.lastName,
        };
    }

    async logout(request: Request): Promise<{ message: string}> {
        return new Promise((resolve, reject) => {
            request.session.destroy((error) => {
                if(error) {
                    reject(
                        new InternalServerErrorException(
                            'No se pudo cerrar la sesion',
                        ),
                    );
                    return;
                }
                resolve({
                    message: 'Sesion cerrada correctamente',
                });
            });
        });
    }
}
