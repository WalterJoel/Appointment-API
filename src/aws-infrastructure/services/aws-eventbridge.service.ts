import { Injectable } from '@nestjs/common';
import { EventBridge } from 'aws-sdk';

@Injectable()
export class AwsEventBridgeService {
  private eventBridge = new EventBridge({ region: process.env.AWS_REGION });
  private eventBusName = process.env.EVENT_BUS_NAME || 'appointment-event-bus';

  async sendEvent(eventDetail: any) {
    const params = {
      Entries: [
        {
          Source: 'appointment-service',
          DetailType: 'AppointmentConfirmed',
          Detail: JSON.stringify(eventDetail),
          EventBusName: this.eventBusName,
        },
      ],
    };
    await this.eventBridge.putEvents(params).promise();
  }
}
