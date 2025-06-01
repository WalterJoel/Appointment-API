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
// import { EventBridge } from 'aws-sdk';

// const eventBridge = new EventBridge();

// export const sendEventToEventBridge = async (eventDetail: any) => {
//   const params = {
//     Entries: [
//       {
//         Source: 'appointment-service',
//         DetailType: 'AppointmentConfirmed',
//         Detail: JSON.stringify(eventDetail),
//         EventBusName: 'appointment-event-bus', // aquí lo pones en duro
//       },
//     ],
//   };

//   try {
//     const a = await eventBridge.putEvents(params).promise();
//     console.log(
//       'Agendamiento conforme, Evento emitido correctamente a EventBridge',
//       process.env.EVENT_BUS_NAME,
//       a,
//     );
//   } catch (error) {
//     console.error('Error al emitir evento a EventBridge:', error);
//     throw new Error('Error al emitir evento');
//   }
// };
