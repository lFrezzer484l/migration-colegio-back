import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

import { Ticket } from './entities/ticket.entity';
import { User } from '../user/entities/user.entity';
import { TicketRecord } from '../ticket-record/entities/ticket-record.entity';
import { Message } from '../message/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      User,
      Message,
      TicketRecord,
    ]),
  ],

  controllers: [
    TicketController,
  ],

  providers: [
    TicketService,
  ],
})
export class TicketModule {}