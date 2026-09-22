import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from './entities/message.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { User } from '../user/entities/user.entity';

import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageEventsService } from './message-events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Ticket,
      User,
    ]),
  ],

  controllers: [
    MessageController,
  ],

  providers: [
    MessageService,
    MessageEventsService,
  ],
})
export class MessageModule {}