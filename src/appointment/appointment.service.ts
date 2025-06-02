import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentModel } from './entities/appointment.model';
import { AwsSnsService } from '../aws-infrastructure/services/aws-sns.service';
import { AwsSecretsService } from '../aws-infrastructure/services/aws-secretsmanager.service';
import { CreateAppointmentRdsDto } from './dto/create-appointment-rds.dto';

import { uuid } from 'uuidv4';
import * as mysql from 'mysql2/promise';

import { AppointmentSnsPayload } from '../aws-infrastructure/interfaces';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly awsSnsService: AwsSnsService,
    private readonly secretsService: AwsSecretsService,
  ) {}
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
  async update(id: string) {
    console.log(' UPDATING FROM SQS', id);
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
  // Insert mysql
  async createRds(
    createAppointmentRdsDto: CreateAppointmentRdsDto,
  ): Promise<void> {
    const { insuredId, scheduleId, countryISO, dynamoId } =
      createAppointmentRdsDto;

    const secretArn =
      countryISO === 'PE'
        ? process.env.SECRET_ARN_PE!
        : process.env.SECRET_ARN_CL!;

    const secret = await this.secretsService.getSecret(secretArn);

    const connection = await mysql.createConnection({
      host: secret.host,
      user: secret.username,
      password: secret.password,
      database: secret.dbname,
    });

    try {
      await connection.execute(
        `INSERT INTO appointments (insured_id, schedule_id, country_iso, dynamo_id) VALUES (?, ?, ?, ?)`,
        [insuredId, scheduleId, countryISO, dynamoId],
      );
    } finally {
      await connection.end();
    }
  }
}
