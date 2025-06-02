import { SQSEvent, SQSHandler } from 'aws-lambda';
import { AwsEventBridgeService } from '../services/aws-eventbridge.service';

import axios from 'axios';

const eventBridgeService = new AwsEventBridgeService();

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

      if (!notification.Message) {
        console.error('Message field is missing or invalid');
        continue;
      }

      const body = JSON.parse(notification.Message);
      console.log('BODY CORRECTO:', body);
      const { insuredId, scheduleId, countryISO, dynamoId } = body;
      await axios.post(
        `${process.env.APPOINTMENT_API_URL}/appointments/mysql`,
        {
          insuredId,
          scheduleId,
          countryISO,
          dynamoId,
        },
      );
      // Insertar cita

      // Enviar evento a EventBridge
      const eventDetail = { insuredId, scheduleId, countryISO, dynamoId };
      await eventBridgeService.sendEvent(eventDetail);
    } catch (error) {
      console.error('Error procesando el mensaje:', error);
      return error.message;
    }
  }
};
