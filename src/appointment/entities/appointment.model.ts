import { AppointmentSchema } from './appointment.schema';
import * as dynamoose from 'dynamoose';

export const AppointmentModel = dynamoose.model(
  'AppointmentTable',
  AppointmentSchema,
  {
    create: false,
  },
);
