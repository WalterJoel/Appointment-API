import { SQSHandler } from 'aws-lambda';
import axios from 'axios';
import { API_BASE_URL } from '../../common/constants';

export const handler: SQSHandler = async (event) => {
  for (const { body } of event.Records) {
    try {
      const parsedBody = JSON.parse(body);
      const dynamoId = parsedBody?.detail?.dynamoId;
      if (!dynamoId) continue;

      const response = await axios.patch(`${API_BASE_URL}/${dynamoId}`, {});
      if (response.status !== 200) {
        console.error(`Failed to update appointment ${dynamoId}`);
      }
    } catch (error) {
      console.error('Error processing message', error);
    }
  }
};
