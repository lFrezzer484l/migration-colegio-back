import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { User } from '../../user/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'text',
  })
  content!: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.messages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'ticket_id',
  })
  ticket!: Ticket;

  @ManyToOne(() => User, (user) => user.messages, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'sender_id',
  })
  sender!: User;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}