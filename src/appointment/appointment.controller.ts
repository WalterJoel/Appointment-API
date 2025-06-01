import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
// import { ApiBody } from '@nestjs/swagger';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {
    console.log('appointmentService in controller:', this.appointmentService);
  }

  // @ApiBody({ type: CreateAppointmentDto })
  @Post('create')
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    try {
      return this.appointmentService.create(createAppointmentDto);
    } catch (error) {
      console.error('❌ Error en AppointmentController.create:', error);
      throw new Error(error);
    }
  }

  // @Get(':insuredId')
  // findByInsure(@Param('id') id: string) {
  //   return this.appointmentService.findByInsure(id);
  // }

  // @Get()
  // findAll() {
  //   return this.appointmentService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.appointmentService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.appointmentService.update(+id);
  }
}
