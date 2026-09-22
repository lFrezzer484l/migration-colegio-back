import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Ticket,
  TicketStatus,
} from './entities/ticket.entity';

import { TicketRecord } from '../ticket-record/entities/ticket-record.entity';

import { User } from '../user/entities/user.entity';

import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketService {

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(TicketRecord)
    private readonly ticketRecordRepository: Repository<TicketRecord>,
  ) {}

  // ==========================================
  // SANITIZAR TICKET
  // ==========================================

  private sanitizeTicket(ticket: Ticket) {

    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      isAnonymous: ticket.isAnonymous,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,

      // ------------------------------------------
      // USUARIO QUE CREÓ EL TICKET
      // ------------------------------------------

      user: ticket.isAnonymous
        ? null
        : ticket.user
          ? {
              id: ticket.user.id,
              username: ticket.user.username,
              email: ticket.user.email,
              firstName: ticket.user.firstName,
              lastName: ticket.user.lastName,
              grade: ticket.user.grade,
            }
          : null,

      // ------------------------------------------
      // ADMINISTRADORES ASIGNADOS
      // ------------------------------------------

      assignedAdmins:
        ticket.assignedAdmins?.map((admin) => ({
          id: admin.id,
          username: admin.username,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role?.name,
        })) ?? [],
    };
  }

  // ==========================================
  // CREAR TICKET
  // USER
  // ==========================================

  async create(
    createTicketDto: CreateTicketDto,
    user: User,
  ) {

    const ticket = this.ticketRepository.create({
      title: createTicketDto.title,
      description: createTicketDto.description,
      isAnonymous: createTicketDto.isAnonymous ?? false,
      status: TicketStatus.OPEN,
      user,
      assignedAdmins: [],
    });

    const savedTicket =
      await this.ticketRepository.save(ticket);

    // ------------------------------------------
    // CREAR REGISTRO HISTÓRICO
    // ------------------------------------------

    const ticketRecord =
      this.ticketRecordRepository.create({
        originalTicketId: savedTicket.id,
        finalStatus: savedTicket.status,
        isAnonymous: savedTicket.isAnonymous,
        closedAt: null,
      });

    await this.ticketRecordRepository.save(
      ticketRecord,
    );

    // ------------------------------------------
    // CARGAR TICKET CON RELACIONES
    // ------------------------------------------

    const ticketWithRelations =
      await this.ticketRepository.findOne({
        where: {
          id: savedTicket.id,
        },
        relations: {
          user: true,
          assignedAdmins: {
            role: true,
          },
        },
      });

    if (!ticketWithRelations) {
      throw new NotFoundException(
        'Ticket creado pero no pudo ser recuperado',
      );
    }

    return {
      message: 'Ticket creado correctamente',
      ticket: this.sanitizeTicket(
        ticketWithRelations,
      ),
    };
  }

  // ==========================================
  // MIS TICKETS
  // USER
  // ==========================================

  async findMyTickets(userId: string) {

    const tickets =
      await this.ticketRepository.find({
        where: {
          user: {
            id: userId,
          },
        },
        relations: {
          user: true,
          assignedAdmins: {
            role: true,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });

    return tickets.map((ticket) =>
      this.sanitizeTicket(ticket),
    );
  }

  // ==========================================
  // TODOS LOS TICKETS
  // ADMIN
  // ==========================================

  async findAll() {

    const tickets =
      await this.ticketRepository.find({
        relations: {
          user: true,
          assignedAdmins: {
            role: true,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });

    return tickets.map((ticket) =>
      this.sanitizeTicket(ticket),
    );
  }

  // ==========================================
  // TICKETS GESTIONADOS
  // ADMIN
  // ==========================================

  async findManagedTickets(adminId: string) {

    const tickets =
      await this.ticketRepository
        .createQueryBuilder('ticket')

        .leftJoinAndSelect(
          'ticket.user',
          'user',
        )

        .leftJoinAndSelect(
          'ticket.assignedAdmins',
          'assignedAdmin',
        )

        .leftJoinAndSelect(
          'assignedAdmin.role',
          'assignedAdminRole',
        )

        .where(
          'assignedAdmin.id = :adminId',
          {
            adminId,
          },
        )

        .orderBy(
          'ticket.createdAt',
          'DESC',
        )

        .getMany();

    return tickets.map((ticket) =>
      this.sanitizeTicket(ticket),
    );
  }

  // ==========================================
  // VER UN TICKET
  // USER / ADMIN
  // ==========================================

  async findOne(
    ticketId: string,
    user: User,
  ) {

    const ticket =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
        relations: {
          user: true,
          assignedAdmins: {
            role: true,
          },
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket no encontrado',
      );
    }

    // ------------------------------------------
    // ADMIN
    // ------------------------------------------

    if (user.role.name === 'admin') {

      return this.sanitizeTicket(
        ticket,
      );
    }

    // ------------------------------------------
    // USER
    // ------------------------------------------

    if (ticket.user.id !== user.id) {

      throw new ForbiddenException(
        'No tienes permiso para ver este ticket',
      );
    }

    return this.sanitizeTicket(
      ticket,
    );
  }

  // ==========================================
  // ACTUALIZAR ESTADO
  // ADMIN
  // ==========================================

  async update(
    ticketId: string,
    updateTicketDto: UpdateTicketDto,
  ) {

    const ticket =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket no encontrado',
      );
    }

    const previousStatus =
      ticket.status;

    ticket.status =
      updateTicketDto.status;

    const updatedTicket =
      await this.ticketRepository.save(
        ticket,
      );

    // ------------------------------------------
    // ACTUALIZAR REGISTRO HISTÓRICO
    // ------------------------------------------

    const ticketRecord =
      await this.ticketRecordRepository.findOne({
        where: {
          originalTicketId: ticket.id,
        },
      });

    if (!ticketRecord) {
      throw new NotFoundException(
        'Registro histórico del ticket no encontrado',
      );
    }

    ticketRecord.finalStatus =
      updatedTicket.status;

    // ------------------------------------------
    // SI SE CIERRA
    // ------------------------------------------

    if (
      previousStatus !== TicketStatus.CLOSED &&
      updatedTicket.status === TicketStatus.CLOSED
    ) {

      ticketRecord.closedAt =
        new Date();
    }

    // ------------------------------------------
    // SI SE REABRE
    // ------------------------------------------

    if (
      updatedTicket.status !== TicketStatus.CLOSED
    ) {

      ticketRecord.closedAt =
        null;
    }

    await this.ticketRecordRepository.save(
      ticketRecord,
    );

    // ------------------------------------------
    // RECUPERAR TICKET CON RELACIONES
    // ------------------------------------------

    const ticketWithRelations =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
        relations: {
          user: true,
          assignedAdmins: {
            role: true,
          },
        },
      });

    if (!ticketWithRelations) {
      throw new NotFoundException(
        'Ticket actualizado pero no pudo ser recuperado',
      );
    }

    return {
      message: 'Ticket actualizado correctamente',
      ticket: this.sanitizeTicket(
        ticketWithRelations,
      ),
    };
  }

  // ==========================================
  // ASIGNAR ADMINISTRADOR A UN TICKET
  // ADMIN
  // ==========================================

  async addAdmin(
    ticketId: string,
    adminId: string,
  ) {

    const ticket =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
        relations: {
          assignedAdmins: {
            role: true,
          },
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket no encontrado',
      );
    }

    const admin =
      await this.userRepository.findOne({
        where: {
          id: adminId,
        },
        relations: {
          role: true,
        },
      });

    if (!admin) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    // ------------------------------------------
    // VALIDAR QUE SEA ADMIN
    // ------------------------------------------

    if (admin.role.name !== 'admin') {

      throw new ForbiddenException(
        'El usuario seleccionado no es un administrador',
      );
    }

    // ------------------------------------------
    // VALIDAR SI YA ESTÁ ASIGNADO
    // ------------------------------------------

    const alreadyAssigned =
      ticket.assignedAdmins.some(
        (assignedAdmin) =>
          assignedAdmin.id === admin.id,
      );

    if (alreadyAssigned) {

      throw new ForbiddenException(
        'El administrador ya está asignado a este ticket',
      );
    }

    // ------------------------------------------
    // ASIGNAR ADMIN
    // ------------------------------------------

    ticket.assignedAdmins.push(
      admin,
    );

    await this.ticketRepository.save(
      ticket,
    );

    // ------------------------------------------
    // RECUPERAR TICKET ACTUALIZADO
    // ------------------------------------------

    const updatedTicket =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
        relations: {
          user: true,
          assignedAdmins: {
            role: true,
          },
        },
      });

    if (!updatedTicket) {
      throw new NotFoundException(
        'Ticket actualizado pero no pudo ser recuperado',
      );
    }

    return {
      message:
        'Administrador asignado correctamente',

      ticket:
        this.sanitizeTicket(
          updatedTicket,
        ),
    };
  }

  // ==========================================
  // QUITAR ADMINISTRADOR DE UN TICKET
  // ADMIN
  // ==========================================

  async removeAdmin(
    ticketId: string,
    adminId: string,
  ) {

    const ticket =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
        relations: {
          assignedAdmins: true,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket no encontrado',
      );
    }

    // ------------------------------------------
    // BUSCAR ADMINISTRADOR
    // ------------------------------------------

    const adminIndex =
      ticket.assignedAdmins.findIndex(
        (admin) =>
          admin.id === adminId,
      );

    if (adminIndex === -1) {

      throw new NotFoundException(
        'El administrador no está asignado a este ticket',
      );
    }

    // ------------------------------------------
    // QUITAR ADMINISTRADOR
    // ------------------------------------------

    ticket.assignedAdmins.splice(
      adminIndex,
      1,
    );

    await this.ticketRepository.save(
      ticket,
    );

    // ------------------------------------------
    // RECUPERAR TICKET ACTUALIZADO
    // ------------------------------------------

    const updatedTicket =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
        relations: {
          user: true,
          assignedAdmins: {
            role: true,
          },
        },
      });

    if (!updatedTicket) {
      throw new NotFoundException(
        'Ticket actualizado pero no pudo ser recuperado',
      );
    }

    return {
      message:
        'Administrador retirado correctamente',

      ticket:
        this.sanitizeTicket(
          updatedTicket,
        ),
    };
  }

  // ==========================================
  // ELIMINAR TICKET
  // ADMIN
  // ==========================================

  async remove(
    ticketId: string,
  ) {

    const ticket =
      await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket no encontrado',
      );
    }

    // ------------------------------------------
    // SOLO SE PUEDEN ELIMINAR CERRADOS
    // ------------------------------------------

    if (
      ticket.status !== TicketStatus.CLOSED
    ) {

      throw new ForbiddenException(
        'Solo se pueden eliminar tickets cerrados',
      );
    }

    // ------------------------------------------
    // ELIMINAR TICKET
    // ------------------------------------------
    // Los mensajes se eliminan por CASCADE.
    // TicketRecord permanece porque no tiene FK
    // hacia tickets.
    // ------------------------------------------

    await this.ticketRepository.remove(
      ticket,
    );

    return {
      message:
        'Ticket eliminado correctamente',
    };
  }
}