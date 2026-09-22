import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { Message } from './entities/message.entity';

import { Ticket } from '../ticket/entities/ticket.entity';

import { User } from '../user/entities/user.entity';

import {
  CreateMessageDto,
} from './dto/create-message.dto';

import {
  MessageEventsService,
} from './message-events.service';

@Injectable()
export class MessageService {

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository:
      Repository<Message>,

    @InjectRepository(Ticket)
    private readonly ticketRepository:
      Repository<Ticket>,

    private readonly messageEventsService:
      MessageEventsService,
  ) {}


  // ==========================================
  // SANITIZAR MENSAJE
  // ==========================================

  private sanitizeMessage(
    message: Message,
    viewer: User,
    isAnonymous: boolean,
  ) {
    const sender = message.sender;


    // ----------------------------------------
    // SIN REMITENTE
    // ----------------------------------------

    if (!sender) {
      return {
        id: message.id,

        content: message.content,

        createdAt: message.createdAt,

        sender: null,
      };
    }


    // ----------------------------------------
    // TICKET NO ANÓNIMO
    // ----------------------------------------

    if (!isAnonymous) {
      return {
        id: message.id,

        content: message.content,

        createdAt: message.createdAt,

        sender: {
          id: sender.id,
          username: sender.username,
          email: sender.email,
          firstName: sender.firstName,
          lastName: sender.lastName,
          role: sender.role?.name,
        },
      };
    }


    // ----------------------------------------
    // TICKET ANÓNIMO
    // ----------------------------------------

    /*
     * Si el ticket es anónimo:
     *
     * 1. El usuario que envió el mensaje
     *    puede ver su propia identidad.
     *
     * 2. Los administradores pueden mostrar
     *    su propia identidad.
     *
     * 3. La identidad del estudiante anónimo
     *    se oculta para los demás.
     */

    const isOwnMessage =
      sender.id === viewer.id;

    const isAdminSender =
      sender.role?.name === 'admin';


    // ----------------------------------------
    // MOSTRAR IDENTIDAD
    // ----------------------------------------

    if (
      isOwnMessage ||
      isAdminSender
    ) {
      return {
        id: message.id,

        content: message.content,

        createdAt: message.createdAt,

        sender: {
          id: sender.id,
          username: sender.username,
          email: sender.email,
          firstName: sender.firstName,
          lastName: sender.lastName,
          role: sender.role?.name,
        },
      };
    }


    // ----------------------------------------
    // OCULTAR IDENTIDAD
    // ----------------------------------------

    return {
      id: message.id,

      content: message.content,

      createdAt: message.createdAt,

      sender: null,
    };
  }


  // ==========================================
  // SANITIZAR EVENTO SSE
  // ==========================================

  sanitizeForEvent(
    message: Message,
    isAnonymous: boolean,
    viewer: User,
  ) {
    return this.sanitizeMessage(
      message,
      viewer,
      isAnonymous,
    );
  }


  // ==========================================
  // VALIDAR ACCESO AL TICKET
  // ==========================================

  async getTicketWithAccess(
    ticketId: string,
    user: User,
  ): Promise<Ticket> {

    const ticket =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },

        relations: {
          user: true,

          assignedAdmins: true,
        },
      });


    // ----------------------------------------
    // TICKET NO EXISTE
    // ----------------------------------------

    if (!ticket) {
      throw new NotFoundException(
        'Ticket no encontrado',
      );
    }


    // ----------------------------------------
    // ESTUDIANTE
    // ----------------------------------------

    if (
      user.role.name === 'user'
    ) {

      if (
        ticket.user.id !== user.id
      ) {
        throw new ForbiddenException(
          'No tienes permiso para acceder a este ticket',
        );
      }

      return ticket;
    }


    // ----------------------------------------
    // ADMINISTRADOR
    // ----------------------------------------

    if (
      user.role.name === 'admin'
    ) {

      const isAssigned =
        ticket.assignedAdmins.some(
          (admin) =>
            admin.id === user.id,
        );


      if (!isAssigned) {
        throw new ForbiddenException(
          'No estás asignado a este ticket',
        );
      }

      return ticket;
    }


    // ----------------------------------------
    // ROL NO PERMITIDO
    // ----------------------------------------

    throw new ForbiddenException(
      'No tienes permisos para acceder a este ticket',
    );
  }


  // ==========================================
  // CREAR MENSAJE
  // ==========================================

  async create(
    ticketId: string,
    createMessageDto: CreateMessageDto,
    user: User,
  ) {

    // ----------------------------------------
    // VALIDAR ACCESO
    // ----------------------------------------

    const ticket =
      await this.getTicketWithAccess(
        ticketId,
        user,
      );


    // ----------------------------------------
    // CREAR MENSAJE
    // ----------------------------------------

    const message =
      this.messageRepository.create({
        content:
          createMessageDto.content,

        ticket,

        sender: user,
      });


    // ----------------------------------------
    // GUARDAR
    // ----------------------------------------

    const savedMessage =
      await this.messageRepository.save(
        message,
      );


    // ----------------------------------------
    // RECUPERAR CON RELACIONES
    // ----------------------------------------

    const messageWithRelations =
      await this.messageRepository.findOne({
        where: {
          id: savedMessage.id,
        },

        relations: {
          sender: {
            role: true,
          },
        },
      });


    if (!messageWithRelations) {
      throw new NotFoundException(
        'Mensaje creado pero no pudo ser recuperado',
      );
    }


    // ----------------------------------------
    // EMITIR EVENTO SSE
    // ----------------------------------------

    this.messageEventsService.emit(
      ticketId,
      {
        message:
          messageWithRelations,

        isAnonymous:
          ticket.isAnonymous,
      },
    );


    // ----------------------------------------
    // RESPUESTA
    // ----------------------------------------

    return {
      message:
        'Mensaje enviado correctamente',

      data:
        this.sanitizeMessage(
          messageWithRelations,
          user,
          ticket.isAnonymous,
        ),
    };
  }


  // ==========================================
  // OBTENER MENSAJES DEL TICKET
  // ==========================================

  async findByTicket(
    ticketId: string,
    user: User,
  ) {

    // ----------------------------------------
    // VALIDAR ACCESO
    // ----------------------------------------

    const ticket =
      await this.getTicketWithAccess(
        ticketId,
        user,
      );


    // ----------------------------------------
    // OBTENER MENSAJES
    // ----------------------------------------

    const messages =
      await this.messageRepository.find({
        where: {
          ticket: {
            id: ticketId,
          },
        },

        relations: {
          sender: {
            role: true,
          },
        },

        order: {
          createdAt: 'ASC',
        },
      });


    // ----------------------------------------
    // SANITIZAR
    // ----------------------------------------

    return messages.map(
      (message) =>
        this.sanitizeMessage(
          message,
          user,
          ticket.isAnonymous,
        ),
    );
  }
}