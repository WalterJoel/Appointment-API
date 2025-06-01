import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import {
  DocCreateAppointment,
  DocFindByInsured,
  DocFindAllAppointments,
} from './docs/appointment.docs';

@Controller()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('create')
  @DocCreateAppointment()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Get(':insuredId')
  @DocFindByInsured()
  findByInsure(@Param('id') id: string) {
    return this.appointmentService.findByInsure(id);
  }

  @Get()
  @DocFindAllAppointments()
  findAll() {
    return this.appointmentService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.appointmentService.update(+id);
  }
}
