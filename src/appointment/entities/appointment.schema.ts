import * as dynamoose from 'dynamoose';

export const AppointmentSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
    },
    insuredId: {
      type: String,
      required: true,
    },
    scheduleId: {
      type: Number,
      required: true,
    },
    countryISO: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'pending', // Initial State
    },
  },
  {
    timestamps: true,
  },
);
