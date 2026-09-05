import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    length: 50,
  })
  name!: string;

  @Column({
    nullable: true,
    length: 255,
  })
  description!: string | null;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}