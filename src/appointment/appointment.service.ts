import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentModel } from './entities/appointment.model';
import { AwsSnsService } from '../aws-infrastructure/services/aws-sns.service';
import { uuid } from 'uuidv4';

import { AppointmentSnsPayload } from '../aws-infrastructure/interfaces';

@Injectable()
export class AppointmentService {
  constructor(private readonly awsSnsService: AwsSnsService) {}
  async create(createAppointmentDto: CreateAppointmentDto) {
    try {
      if (!createAppointmentDto) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'No se envió la data correcta' }),
        };
      }
      const appointment = await AppointmentModel.create({
        id: uuid(),
        ...createAppointmentDto,
      });

      // Notificacion To SNS
      const messageToSNS: AppointmentSnsPayload = {
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO,
        dynamoId: appointment.id,
      };
      await this.awsSnsService.publishAppointment(messageToSNS);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Correcto, el Agendamiento de cita está en proceso',
          data: appointment,
        }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal server error',
          error: error.message,
        }),
      };
    }
  }
  async findByInsure(insureId: string) {
    try {
      if (!insureId) {
        return '!No pasaste el id del asegurado';
      }
      const appointments = await AppointmentModel.scan('insuredId')
        .eq(insureId)
        .exec();
      const results = appointments.toJSON();

      if (!results || results.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message:
              'No se encontró agendamientos de cita para el asegurado buscado',
          }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ data: results }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal server error',
          error: error.message,
        }),
      };
    }
  }
  async findAll() {
    try {
      const appointments = await AppointmentModel.scan().exec();
      const results = appointments.toJSON();

      if (!results || results.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: 'No se encontraron agendamientos de cita registrados',
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ data: results }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error interno al consultar los agendamientos',
          error: error.message,
        }),
      };
    }
  }
  async update(id: number) {
    try {
      const appointment = await AppointmentModel.update(
        { id },
        { status: 'COMPLETED' },
      );

      if (!appointment)
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Agendamiento no encontrado' }),
        };

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Updated successfully',
          data: appointment,
        }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error updating appointment',
          error: error.message,
        }),
      };
    }
  }
}
