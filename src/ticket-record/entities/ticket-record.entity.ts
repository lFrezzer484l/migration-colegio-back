import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TicketStatus } from '../../ticket/entities/ticket.entity';

@Entity('ticket_records')
export class TicketRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'original_ticket_id',
    type: 'uuid',
  })
  originalTicketId!: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
  })
  finalStatus!: TicketStatus;

  @Column({
    name: 'is_anonymous',
  })
  isAnonymous!: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @Column({
    name: 'closed_at',
    type: 'timestamp',
    nullable: true,
  })
  closedAt!: Date | null;
}