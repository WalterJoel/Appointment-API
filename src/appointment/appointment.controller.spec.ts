import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let service: AppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: {
            create: jest.fn().mockResolvedValue({ message: 'created' }),
            createRds: jest.fn().mockResolvedValue({ message: 'rds created' }),
            findByInsure: jest.fn().mockResolvedValue([{ id: '1' }]),
            findAll: jest.fn().mockResolvedValue([
              {
                insuredId: '00015',
                scheduleId: 100,
                countryISO: 'PE',
                dynamoId: 'mocked-uuid',
                status: 'completed',
                createdAt: new Date().toISOString(),
              },
              {
                insuredId: '00016',
                scheduleId: 101,
                countryISO: 'PE',
                dynamoId: 'mocked-uuid-2',
                status: 'completed',
                createdAt: new Date().toISOString(),
              },
            ]),
            update: jest.fn().mockResolvedValue({ message: 'updated' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    service = module.get<AppointmentService>(AppointmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an appointment', async () => {
    const dto: CreateAppointmentDto = {
      insuredId: '123',
      date: new Date().toISOString(),
    } as any;

    const result = await controller.create(dto);
    expect(result).toEqual({ message: 'created' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return appointments by insured ID', async () => {
    const result = await controller.findByInsure('1');
    expect(result).toEqual([{ id: '1' }]);
    expect(service.findByInsure).toHaveBeenCalledWith('1');
  });

  it('should return all appointments with expected fields', async () => {
    const result = await controller.findAll();

    expect(Array.isArray(result)).toBe(true);

    if (Array.isArray(result)) {
      expect(result.length).toBe(2);

      for (const item of result) {
        expect(item).toHaveProperty('insuredId');
        expect(item).toHaveProperty('scheduleId');
        expect(item).toHaveProperty('countryISO');
        expect(item).toHaveProperty('dynamoId');
        expect(item).toHaveProperty('status', 'completed');
        expect(item).toHaveProperty('createdAt');
        expect(typeof item.createdAt).toBe('string');
      }
    }

    expect(service.findAll).toHaveBeenCalled();
  });

  it('should update appointment', async () => {
    const result = await controller.update('1');
    expect(result).toEqual({ message: 'updated' });
    expect(service.update).toHaveBeenCalledWith('1');
  });
});
