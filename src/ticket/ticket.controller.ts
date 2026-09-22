import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';

import type { Request } from 'express';

import { TicketService } from './ticket.service';

import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

import { SessionGuard } from '../auth/guards/session.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('tickets')
@UseGuards(SessionGuard)
export class TicketController {

  constructor(
    private readonly ticketService: TicketService,
  ) {}

  // ==========================================
  // USER - CREAR TICKET
  // ==========================================

  @Post()
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('user')
  create(
    @Body() createTicketDto: CreateTicketDto,
    @Req() request: Request,
  ) {

    return this.ticketService.create(
      createTicketDto,
      request.user!,
    );
  }

  // ==========================================
  // USER - MIS TICKETS
  // ==========================================

  @Get('mis-tickets')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('user')
  findMyTickets(
    @Req() request: Request,
  ) {

    return this.ticketService.findMyTickets(
      request.user!.id,
    );
  }

  // ==========================================
  // ADMIN - TODOS LOS TICKETS
  // ==========================================

  @Get()
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin')
  findAll() {

    return this.ticketService.findAll();
  }

  // ==========================================
  // ADMIN - TICKETS GESTIONADOS
  // ==========================================

  @Get('gestionados')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin')
  findManagedTickets(
    @Req() request: Request,
  ) {

    return this.ticketService.findManagedTickets(
      request.user!.id,
    );
  }

  // ==========================================
  // USER / ADMIN - VER TICKET
  // ==========================================

  @Get(':id')
  findOne(
    @Param('id') ticketId: string,
    @Req() request: Request,
  ) {

    return this.ticketService.findOne(
      ticketId,
      request.user!,
    );
  }

  // ==========================================
  // ADMIN - ACTUALIZAR TICKET
  // ==========================================

  @Patch(':id')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') ticketId: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {

    return this.ticketService.update(
      ticketId,
      updateTicketDto,
    );
  }

    // ==========================================
  // ADMIN - ASIGNAR ADMINISTRADOR
  // ==========================================

  @Post(':id/admins/:adminId')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin')
  addAdmin(
    @Param('id') ticketId: string,
    @Param('adminId') adminId: string,
  ) {

    return this.ticketService.addAdmin(
      ticketId,
      adminId,
    );
  }

  // ==========================================
  // ADMIN - QUITAR ADMINISTRADOR
  // ==========================================

  @Delete(':id/admins/:adminId')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin')
  removeAdmin(
    @Param('id') ticketId: string,
    @Param('adminId') adminId: string,
  ) {

    return this.ticketService.removeAdmin(
      ticketId,
      adminId,
    );
  }

  // ==========================================
// ADMIN - ELIMINAR TICKET
// ==========================================
    @Delete(':id')
    @UseGuards(SessionGuard, RolesGuard)
    @Roles('admin')
    remove(
        @Param('id') ticketId: string,
    ) {
        return this.ticketService.remove(ticketId);
    }
}