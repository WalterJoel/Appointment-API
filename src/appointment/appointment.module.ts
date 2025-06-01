import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService], // Opcional si solo lo usas dentro del módulo
})
export class AppointmentModule {}
