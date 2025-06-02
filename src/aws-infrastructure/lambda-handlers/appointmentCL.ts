import { SQSEvent, SQSHandler } from 'aws-lambda';
import { AwsEventBridgeService } from '../services/aws-eventbridge.service';
import { AppointmentSnsPayload } from '../interfaces';

import axios from 'axios';
import { API_BASE_URL } from '../../common/constants';

const eventBridgeService = new AwsEventBridgeService();
const API_BASE = `${API_BASE_URL}/createRds`;

export const handler: SQSHandler = async (event: SQSEvent) => {
  if (!event.Records) {
    throw new Error('No records from SQS');
  }
  for (const record of event.Records) {
    try {
      if (!record.body) {
        console.error('Record body is undefined or empty');
        continue;
      }
      const notification = JSON.parse(record.body);

      if (!notification?.Message) {
        console.error('Message field is missing or invalid');
        continue;
      }

      const body: AppointmentSnsPayload = JSON.parse(notification.Message);

      // Insertar cita rds
      try {
        await axios.post(API_BASE, body);
      } catch (error: any) {
        console.error(
          'Error al enviar a Insertar a RDS',
          error?.message || error,
        );
        continue;
      }

      // Enviar evento a EventBridge
      await eventBridgeService.sendEvent(body);
    } catch (error) {
      console.error('Error procesando el mensaje:', error);
      continue;
    }
  }
};
