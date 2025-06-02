import { Injectable } from '@nestjs/common';
import { SNS } from 'aws-sdk';
import { AppointmentSnsPayload } from '../interfaces';

@Injectable()
export class AwsSnsService {
  private sns = new SNS({ region: process.env.AWS_REGION });
  private topicArn = process.env.SNS_TOPIC_ARN;

  async publishAppointment(message: AppointmentSnsPayload) {
    if (!this.topicArn) {
      throw new Error('SNS_TOPIC_ARN is not defined');
    }
    await this.sns
      .publish({
        TopicArn: this.topicArn,
        Message: JSON.stringify(message),
        MessageAttributes: {
          countryISO: {
            DataType: 'String',
            StringValue: message.countryISO,
          },
        },
      })
      .promise();
  }
}
