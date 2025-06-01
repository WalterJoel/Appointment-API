import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './appointment.service';
import { AwsSnsService } from '../aws-infrastructure/services/aws-sns.service';
import { AppointmentModel } from './entities/appointment.model';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

import { uuid } from 'uuidv4';

jest.mock('uuidv4', () => ({
  uuid: jest.fn().mockReturnValue('mocked-uuid'),
}));
describe('AppointmentService', () => {
  let service: AppointmentService;

  const mockAwsSnsService = {
    publishAppointment: jest.fn(),
  };

  const mockCreate = jest.fn();

  beforeEach(async () => {
    // Mockeo de AppointmentModel.create
    jest.spyOn(AppointmentModel, 'create').mockImplementation(mockCreate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: AwsSnsService,
          useValue: mockAwsSnsService,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should return 400 if dto is not provided', async () => {
      const result = await service.create(null);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).message).toBe(
        'No se envió la data correcta',
      );
    });

    it('should create an appointment and send SNS notification', async () => {
      const dto: CreateAppointmentDto = {
        insuredId: '00015',
        scheduleId: 100,
        countryISO: 'PE',
      };

      const fakeAppointment = {
        id: 'mocked-uuid',
        ...dto,
      };

      mockCreate.mockResolvedValue(fakeAppointment);
      mockAwsSnsService.publishAppointment.mockResolvedValue(undefined);

      const result = await service.create(dto);

      // Validaciones
      expect(AppointmentModel.create).toHaveBeenCalledWith({
        id: 'mocked-uuid',
        ...dto,
      });

      expect(mockAwsSnsService.publishAppointment).toHaveBeenCalledWith({
        insuredId: dto.insuredId,
        scheduleId: dto.scheduleId,
        countryISO: dto.countryISO,
        dynamoId: 'mocked-uuid',
      });

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).message).toContain('Correcto');
      expect(JSON.parse(result.body).data).toEqual(fakeAppointment);
    });

    it('should return 500 on error', async () => {
      mockCreate.mockRejectedValue(new Error('DB error'));

      const dto: CreateAppointmentDto = {
        insuredId: '00015',
        scheduleId: 100,
        countryISO: 'PE',
      };

      const result = await service.create(dto);

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body).message).toBe('Internal server error');
      expect(JSON.parse(result.body).error).toBe('DB error');
    });
  });
});
