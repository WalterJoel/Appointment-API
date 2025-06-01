import { Module } from '@nestjs/common';
import { AwsSnsService } from './services/aws-sns.service';
import { AwsSecretsService } from './services/aws-secretsmanager.service';
import { AwsEventBridgeService } from './services/aws-eventbridge.service';

@Module({
  providers: [AwsSnsService, AwsEventBridgeService, AwsSecretsService],
  exports: [AwsSnsService, AwsEventBridgeService, AwsSecretsService],
})
export class AwsServicesModule {}
