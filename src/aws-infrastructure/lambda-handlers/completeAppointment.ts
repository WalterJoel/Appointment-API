import { SQSHandler } from 'aws-lambda';
import axios from 'axios';

const API_BASE_URL = process.env.API_APPOINTMENT_URL;

export const handler: SQSHandler = async (event) => {
  for (const { body } of event.Records) {
    try {
      const parsedBody = JSON.parse(body);
      console.log(' LLEGA HASTA EL ULTIMO PASO LA DATA: ', parsedBody);
      const dynamoId = parsedBody?.detail?.dynamoId;
      console.log(parsedBody, dynamoId, ' ENTRANDO A ACTUALIZAR');
      if (!dynamoId) continue;

      const response = await axios.patch(`${API_BASE_URL}/${dynamoId}`, {});
      console.log('RUTA QE APLICA AXIOS ', `${API_BASE_URL}/${dynamoId}`);
      if (response.status !== 200) {
        console.error(`Failed to update appointment ${dynamoId}`);
      }
    } catch (error) {
      console.error('Error processing message', error);
    }
  }
};
