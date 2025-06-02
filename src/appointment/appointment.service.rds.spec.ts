import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './appointment.service';
import { AwsSnsService } from '../aws-infrastructure/services/aws-sns.service';
import { AwsSecretsService } from '../aws-infrastructure/services/aws-secretsmanager.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateAppointmentRdsDto } from './dto/create-appointment-rds.dto';
import { AppointmentModel } from './entities/appointment.model';
import { SECRET_ARN_PE } from '../common/constants';
import * as mysql from 'mysql2/promise';

jest.mock('mysql2/promise', () => ({
  createConnection: jest.fn(),
}));

jest.mock('./entities/appointment.model', () => ({
  AppointmentModel: {
    create: jest.fn(),
  },
}));

describe('AppointmentService', () => {
  let service: AppointmentService;
  let mockAwsSnsService: Partial<AwsSnsService>;
  let mockAwsSecretsService: Partial<AwsSecretsService>;

  beforeEach(async () => {
    mockAwsSnsService = {
      publishAppointment: jest.fn(),
    };

    mockAwsSecretsService = {
      getSecret: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        { provide: AwsSnsService, useValue: mockAwsSnsService },
        { provide: AwsSecretsService, useValue: mockAwsSecretsService },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
  });

  describe('createRds()', () => {
    const mockExecute = jest.fn();
    const mockEnd = jest.fn();

    beforeEach(() => {
      (mysql.createConnection as jest.Mock).mockResolvedValue({
        execute: mockExecute,
        end: mockEnd,
      });

      (mockAwsSecretsService.getSecret as jest.Mock).mockResolvedValue({
        host: 'mock-host',
        username: 'mock-user',
        password: 'mock-password',
        dbname: 'mock-db',
      });
    });

    it('should insert into MySQL without using process.env', async () => {
      const dto: CreateAppointmentRdsDto = {
        insuredId: '00015',
        scheduleId: 100,
        countryISO: 'PE',
        dynamoId: 'mocked-uuid',
      };

      await service.createRds(dto);

      expect(mockAwsSecretsService.getSecret).toHaveBeenCalledWith(
        SECRET_ARN_PE,
      );
      expect(mysql.createConnection).toHaveBeenCalledWith({
        host: 'mock-host',
        user: 'mock-user',
        password: 'mock-password',
        database: 'mock-db',
      });

      expect(mockExecute).toHaveBeenCalledWith(
        `INSERT INTO appointments (insured_id, schedule_id, country_iso, dynamo_id) VALUES (?, ?, ?, ?)`,
        ['00015', 100, 'PE', 'mocked-uuid'],
      );

      expect(mockEnd).toHaveBeenCalled();
    });
  });
});
