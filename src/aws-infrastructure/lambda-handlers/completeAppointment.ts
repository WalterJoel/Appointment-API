// src/sqs/completeAppointments.ts
import { SQSHandler, SQSEvent } from 'aws-lambda';
import { AppointmentService } from '../../appointment/appointment.service';

const appointmentService = new AppointmentService();

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const dynamoId = body?.detail?.dynamoId;

      if (!dynamoId) {
        throw new Error(
          `dynamoId not found in message body: ${JSON.stringify(body)}`,
        );
      }

      await appointmentService.update(dynamoId);
      console.log(`Appointment with ID ${dynamoId} updated to COMPLETED`);
    } catch (error) {
      console.error('Error processing message:', record.body, error);
    }
  }
};
