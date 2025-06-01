import { EventBridge } from 'aws-sdk';

const eventBridge = new EventBridge();

export const sendEventToEventBridge = async (eventDetail: any) => {
  const params = {
    Entries: [
      {
        Source: 'appointment-service',
        DetailType: 'AppointmentConfirmed',
        Detail: JSON.stringify(eventDetail),
        EventBusName: 'appointment-event-bus', // aquí lo pones en duro
      },
    ],
  };

  try {
    const a = await eventBridge.putEvents(params).promise();
    console.log(
      'Agendamiento conforme, Evento emitido correctamente a EventBridge',
      process.env.EVENT_BUS_NAME,
      a,
    );
  } catch (error) {
    console.error('Error al emitir evento a EventBridge:', error);
    throw new Error('Error al emitir evento');
  }
};
