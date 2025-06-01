import { SQSEvent, SQSHandler } from 'aws-lambda';
import * as mysql from 'mysql2/promise';

import { sendEventToEventBridge } from '../services/eventbridge.service';

// Configuración de la conexión MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST_PE,
  user: process.env.MYSQL_USER_PE,
  password: process.env.MYSQL_PASSWORD_PE,
  database: process.env.MYSQL_DB_PE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// const dynamoDb = new DynamoDB.DocumentClient();
export const handler: SQSHandler = async (event: SQSEvent) => {
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
      await sendEventToEventBridge(eventDetail);
    } catch (error) {
      console.error('Error procesando el mensaje:', error);
      return error.message;
    }
  }
};
