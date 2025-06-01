import { SQSEvent, SQSHandler } from 'aws-lambda';
import * as mysql from 'mysql2/promise';

import { AwsEventBridgeService } from '../services/aws-eventbridge.service';
import { AwsSecretsService } from '../services/aws-secretsmanager.service';

const eventBridgeService = new AwsEventBridgeService();
const secretsService = new AwsSecretsService();

let pool = null;

// const dynamoDb = new DynamoDB.DocumentClient();
export const handler: SQSHandler = async (event: SQSEvent) => {
  if (!pool) {
    const secretArn = process.env.SECRET_ARN_PE!;
    const secret = await secretsService.getSecret(secretArn);

    pool = mysql.createPool({
      host: secret.host,
      user: secret.username,
      password: secret.password,
      database: secret.dbname,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  console.log(event, ' RECORDS');
  if (!event.Records) {
    throw new Error('No records from SNS');
  }
  for (const record of event.Records) {
    try {
      // Primero, revisa que record.body esté bien
      if (!record.body) {
        console.error('Record body is undefined or empty');
        return; // Salir si no hay un body válido
      }
      const [rows] = await pool.query('SELECT 1 + 1 AS result');
      console.log('Test conexión MySQL:', rows);

      const notification = JSON.parse(record.body); // primer parse
      console.log('NOTIFICATION PE:', notification);

      // Verifica que notification.Message sea un JSON válido
      if (!notification.Message) {
        console.error('Message field is missing or invalid');
        return;
      }

      const body = JSON.parse(notification.Message); // segundo parse
      console.log('BODY CORRECTO:', body);
      const { insuredId, scheduleId, countryISO, dynamoId } = body;

      // Insertar cita
      const queryResult = await pool.execute(
        `INSERT INTO appointments (insured_id, schedule_id, country_iso, dynamo_id) VALUES (?, ?, ?, ?)`,
        [insuredId, scheduleId, countryISO, dynamoId],
      );
      console.log('Insert exitoso:', queryResult);

      // Enviar evento a EventBridge
      const eventDetail = { insuredId, scheduleId, countryISO, dynamoId };
      await eventBridgeService.sendEvent(eventDetail);
    } catch (error) {
      console.error('Error procesando el mensaje:', error);
      return error.message;
    }
  }
};
