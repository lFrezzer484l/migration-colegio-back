import { Controller, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Role } from '../rol/entities/role.entity';
import { Person } from '../person/entities/person.entity';
import { DocumentType } from '../document-type/entities/document-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Person, DocumentType]),
    ],
  controllers: [AuthController],
  providers: [AuthService],

})

export class AuthModule {}