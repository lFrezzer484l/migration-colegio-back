import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

import { Message } from './entities/message.entity';

export type MessageEventData = {
  message: Message;
  isAnonymous: boolean;
};

@Injectable()
export class MessageEventsService {
  private readonly subjects =
    new Map<
      string,
      Subject<MessageEventData>
    >();


  // ==========================================
  // OBTENER STREAM DEL TICKET
  // ==========================================

  getStream(
    ticketId: string,
  ) {
    let subject =
      this.subjects.get(ticketId);

    if (!subject) {
      subject =
        new Subject<MessageEventData>();

      this.subjects.set(
        ticketId,
        subject,
      );
    }

    return subject;
  }


  // ==========================================
  // EMITIR NUEVO MENSAJE
  // ==========================================

  emit(
    ticketId: string,
    data: MessageEventData,
  ) {
    const subject =
      this.subjects.get(ticketId);

    if (!subject) {
      return;
    }

    subject.next(data);
  }


  // ==========================================
  // ELIMINAR STREAM
  // ==========================================

  removeStream(
    ticketId: string,
  ) {
    const subject =
      this.subjects.get(ticketId);

    if (!subject) {
      return;
    }

    subject.complete();

    this.subjects.delete(
      ticketId,
    );
  }
}