import { Injectable } from '@nestjs/common';
import { EventBridge } from 'aws-sdk';
import { EVENT_BUS_NAME } from '../../common/constants';
@Injectable()
export class AwsEventBridgeService {
  private eventBridge = new EventBridge({ region: process.env.AWS_REGION });
  private eventBusName = EVENT_BUS_NAME;

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
