export interface Appointment {
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  status: string;
}

export interface AppointmentSnsPayload {
  dynamoId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
}
