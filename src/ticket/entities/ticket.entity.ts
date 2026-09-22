import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from '../../message/entities/message.entity';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    length: 100,
  })
  title!: string;

  @Column({
    type: 'text',
  })
  description!: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status!: TicketStatus;

  @Column({
    name: 'is_anonymous',
    default: false,
  })
  isAnonymous!: boolean;

  @ManyToOne(() => User, (user) => user.tickets, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;
  
  @ManyToMany(() => User, (user) => user.assignedTickets)
  @JoinTable({
    name: 'ticket_admins',
    joinColumn: {
      name: 'ticket_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'admin_id',
      referencedColumnName: 'id',
    },
  })
assignedAdmins!: User[];

  @OneToMany(() => Message, (message) => message.ticket)
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