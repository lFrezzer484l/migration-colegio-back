import {
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

import { TicketStatus } from '../entities/ticket.entity';

export class UpdateTicketDto {

  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status!: TicketStatus;
}