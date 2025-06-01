import { Module } from '@nestjs/common';
import { AppointmentModule } from './appointment/appointment.module';
import { AwsServicesModule } from './aws-infrastructure/aws-services.module';

@Module({
  imports: [AppointmentModule, AwsServicesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
