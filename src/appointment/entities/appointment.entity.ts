import { IsString, IsNumber, IsEnum } from 'class-validator';

export enum CountryISO {
  PE = 'PE',
  CL = 'CL',
}

export class Appointment {
  @IsString()
  id: string;

  @IsString()
  insuredId: string;

  @IsNumber()
  scheduleId: number;

  @IsEnum(CountryISO)
  countryISO: CountryISO; // País (PE o CL)

  @IsString()
  status: string; // Estado de la cita, por defecto "pending"

  @IsString()
  createdAt: string; // Fecha de creación
}
