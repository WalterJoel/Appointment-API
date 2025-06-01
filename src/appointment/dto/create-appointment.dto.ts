import { IsString, IsNumber, IsIn, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    example: '00015',
    description: 'Código de asegurado de 5 dígitos',
  })
  @IsString()
  @Length(5, 5)
  insuredId: string;

  @ApiProperty({
    example: 100,
    description: 'Identificador del espacio de agendamiento',
  })
  @IsNumber()
  scheduleId: number;

  @ApiProperty({
    example: 'PE',
    description: 'Código de país (PE o CL)',
  })
  @IsString()
  @IsIn(['PE', 'CL'])
  countryISO: string;
}
