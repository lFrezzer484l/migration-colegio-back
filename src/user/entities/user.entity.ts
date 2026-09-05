import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from '../../rol/entities/role.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { Message } from '../../message/entities/message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    length: 50,
  })
  username!: string;

  @Column({
    unique: true,
    length: 255,
  })
  email!: string;

  @Column({
    length: 255,
  })
  password!: string;

  @Column({
    name: 'first_name',
    length: 100,
  })
  firstName!: string;

  @Column({
    name: 'last_name',
    length: 100,
  })
  lastName!: string;

  @Column({
    nullable: true,
  })
  grade!: number | null;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'role_id',
  })
  role!: Role;

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets!: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.assignedAdmin)
  assignedTickets!: Ticket[];

  @OneToMany(() => Message, (message) => message.sender)
  messages!: Message[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}