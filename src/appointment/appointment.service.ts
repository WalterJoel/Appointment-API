import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
// import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentModel } from './entities/appointment.model';
import { publishToSNS } from '../aws-infrastructure/services/sns.service';
import { uuid } from 'uuidv4';

import { AppointmentSnsPayload } from '../aws-infrastructure/interfaces';

@Injectable()
export class AppointmentService {
  constructor() {
    console.log('AppointmentService creado');
  }
  async create(createAppointmentDto: CreateAppointmentDto) {
    console.log('EN CREAR', createAppointmentDto);
    try {
      if (!createAppointmentDto) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'No body found in the request' }),
        };
      }
      const appointment = await AppointmentModel.create({
        id: uuid(),
        ...createAppointmentDto,
      });
      // Data To SNS
      const messageToSNS: AppointmentSnsPayload = {
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO,
        dynamoId: appointment.id,
      };
      await publishToSNS(messageToSNS);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Appointment created successfully',
          data: appointment,
        }),
      };
    } catch (error) {
      console.error('Error saving appointment:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal server error',
          error: error.message,
        }),
      };
    }
  }
  // async findByInsure(insureId: string) {
  //   try {
  //     if (!insureId) {
  //       return '!InsureId not passed';
  //     }
  //     const appointments = await AppointmentModel.scan('insuredId')
  //       .eq(insureId)
  //       .exec();
  //     const results = appointments.toJSON();

  //     if (!results || results.length === 0) {
  //       return {
  //         statusCode: 404,
  //         body: JSON.stringify({ message: 'No appointments found' }),
  //       };
  //     }
  //     return {
  //       statusCode: 200,
  //       body: JSON.stringify({ data: results }),
  //     };
  //   } catch (error) {
  //     return {
  //       statusCode: 500,
  //       body: JSON.stringify({
  //         message: 'Internal server error',
  //         error: error.message,
  //       }),
  //     };
  //   }
  // }

  async update(id: number) {
    try {
      const appointment = await AppointmentModel.update(
        { id },
        { status: 'COMPLETED' },
      );

      if (!appointment)
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Appointment not found' }),
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
