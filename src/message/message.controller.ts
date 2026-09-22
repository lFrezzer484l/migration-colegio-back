import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import {
  Observable,
} from 'rxjs';

import {
  map,
} from 'rxjs/operators';

import {
  MessageService,
} from './message.service';

import {
  MessageEventsService,
} from './message-events.service';

import {
  CreateMessageDto,
} from './dto/create-message.dto';

import {
  SessionGuard,
} from '../auth/guards/session.guard';

@Controller(
  'tickets/:ticketId/messages',
)
@UseGuards(SessionGuard)
export class MessageController {

  constructor(
    private readonly messageService:
      MessageService,

    private readonly messageEventsService:
      MessageEventsService,
  ) {}


  // ==========================================
  // ENVIAR MENSAJE
  // ==========================================

  @Post()
  create(
    @Param('ticketId')
    ticketId: string,

    @Body()
    createMessageDto: CreateMessageDto,

    @Req()
    request: Request,
  ) {

    return this.messageService.create(
      ticketId,

      createMessageDto,

      request.user!,
    );
  }


  // ==========================================
  // OBTENER HISTORIAL
  // ==========================================

  @Get()
  findByTicket(
    @Param('ticketId')
    ticketId: string,

    @Req()
    request: Request,
  ) {

    return this.messageService.findByTicket(
      ticketId,

      request.user!,
    );
  }


  // ==========================================
  // STREAM SSE
  // ==========================================

  @Sse('stream')
async streamMessages(
  @Param('ticketId')
  ticketId: string,

  @Req()
  request: Request,
): Promise<Observable<MessageEvent>> {

  await this.messageService
    .getTicketWithAccess(
      ticketId,
      request.user!,
    );

  const viewer =
    request.user!;

  return this.messageEventsService
    .getStream(ticketId)
    .pipe(
      map((event) => ({
        data:
          this.messageService
            .sanitizeForEvent(
              event.message,
              event.isAnonymous,
              viewer,
            ),
      })),
    );
}
}