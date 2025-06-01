import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';

export function DocCreateAppointment() {
  return applyDecorators(
    ApiTags('Crear Agendamiento'),
    ApiOperation({
      summary: 'Crear un agendamiento de cita',
      description:
        '✅ Este endpoint crea un agendamiento de cita y lo almacena en DynamoDB con estado "PENDING".\n\n' +
        '📤 Además, publica un mensaje en AWS SNS para ser distribuido según el país (`countryISO`).\n\n' +
        '⚠️ El cuerpo debe incluir `insuredId`, `scheduleId` y `countryISO`.\n\n' +
        '🔄 La respuesta incluye el objeto almacenado y un mensaje de éxito.',
    }),
    ApiBody({
      description: 'Datos necesarios para registrar el agendamiento',
      type: CreateAppointmentDto,
    }),
    ApiOkResponse({
      description:
        'Agendamiento registrado y notificación enviada correctamente.',
    }),
    ApiBadRequestResponse({
      description: 'El cuerpo de la solicitud está incompleto o ausente.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocurrió un error al procesar el agendamiento.',
    }),
  );
}
export function DocUpdateAppointment() {
  return applyDecorators(
    ApiTags('Actualizar Agendamiento'),
    ApiOperation({
      summary: 'Actualizar el estado de un agendamiento a COMPLETED',
      description:
        '⚠️ *Este endpoint es solo informativo.*\n\n' +
        'No se puede ejecutar desde Swagger. Internamente el sistema cambia el estado de un agendamiento a "COMPLETED", usando el ID como identificador.',
      deprecated: true,
    }),
    ApiParam({
      name: 'id',
      type: String,
      required: true,
      description: 'ID único del agendamiento a actualizar',
    }),
    ApiOkResponse({
      description: 'Agendamiento actualizado correctamente.',
    }),
    ApiNotFoundResponse({
      description: 'No se encontró el agendamiento con el ID proporcionado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocurrió un error al actualizar el agendamiento.',
    }),
  );
}

export function DocFindByInsured() {
  return applyDecorators(
    ApiTags('Buscar agendamiento por ID'),
    ApiOperation({
      summary: 'Buscar agendamientos por ID de asegurado',
      description:
        '✅ Devuelve una lista de agendamientos asociados al ID de un asegurado.\n\n' +
        '📌 Busca en DynamoDB por el campo `insuredId`.\n\n' +
        '⚠️ Si no se encuentran resultados, se retorna un código 404.',
    }),
    ApiParam({
      name: 'insuredId',
      type: String,
      required: true,
      description: 'ID del asegurado (insuredId)',
    }),
    ApiOkResponse({
      description: 'Agendamientos encontrados exitosamente.',
    }),
    ApiNotFoundResponse({
      description: 'No se encontraron agendamientos para el ID proporcionado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Error interno al consultar los agendamientos.',
    }),
  );
}

export function DocFindAllAppointments() {
  return applyDecorators(
    ApiTags('Buscar todos los Agendamientos'),

    ApiOperation({
      summary: 'Listar todos los agendamientos de cita',
      description:
        '📋 Este endpoint retorna todos los agendamientos de cita registrados en la base de datos.\n\n' +
        '🔍 Utiliza una operación de escaneo en DynamoDB para obtener todos los registros disponibles.\n\n' +
        '✅ Ideal para fines administrativos o de auditoría.',
    }),
    ApiOkResponse({
      description: 'Lista de agendamientos obtenida exitosamente.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Error interno al listar los agendamientos.',
    }),
  );
}
