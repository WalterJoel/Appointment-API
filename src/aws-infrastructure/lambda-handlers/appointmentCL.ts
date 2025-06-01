import { SQSEvent, SQSHandler } from 'aws-lambda';
import { SQS } from 'aws-sdk';
import mysql from 'mysql2';
// import { DynamoDB } from 'aws-sdk';

// Configuración de la conexión MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST, // El host de tu base de datos RDS
  user: process.env.MYSQL_USER, // El usuario de la base de datos
  password: process.env.MYSQL_PASSWORD, // La contraseña de la base de datos
  database: process.env.MYSQL_DB, // El nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// const dynamoDb = new DynamoDB.DocumentClient();

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      // Primero, revisa que record.body esté bien
      if (!record.body) {
        console.error('Record body is undefined or empty');
        return; // Salir si no hay un body válido
      }

      const notification = JSON.parse(record.body); // primer parse
      console.log('NOTIFICATION:', notification);

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
      // Enviar evento a EventBridge
      const eventDetail = { insuredId, scheduleId, countryISO, dynamoId };
      // await sendEventToEventBridge(eventDetail);
      console.log('Insert exitoso:', queryResult);
    } catch (error) {
      console.error('Error procesando el mensaje:', error);
      return error.message;
    }
  }
};
