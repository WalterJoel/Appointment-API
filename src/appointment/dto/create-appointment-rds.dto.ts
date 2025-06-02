import { IsString, IsNumber, IsIn, Length } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';

export class CreateAppointmentRdsDto extends CreateAppointmentDto {
  @IsString()
  dynamoId: string;
}
