import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AwsServicesModule } from '../aws-infrastructure/aws-services.module';
@Module({
  imports: [AwsServicesModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  // exports: [AppointmentService], // Opcional si solo lo usas dentro del módulo
})
export class AppointmentModule {}
