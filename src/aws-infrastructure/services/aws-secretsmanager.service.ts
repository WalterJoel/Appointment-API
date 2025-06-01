import { Injectable } from '@nestjs/common';
import { SecretsManager } from 'aws-sdk';

@Injectable()
export class AwsSecretsService {
  private cachedSecrets: Record<string, any> = {};
  private client: SecretsManager;

  constructor() {
    this.client = new SecretsManager({ region: process.env.AWS_REGION });
  }

  async getSecret(secretArn: string): Promise<any> {
    if (this.cachedSecrets[secretArn]) {
      return this.cachedSecrets[secretArn];
    }

    const data = await this.client
      .getSecretValue({ SecretId: secretArn })
      .promise();

    if ('SecretString' in data && data.SecretString) {
      this.cachedSecrets[secretArn] = JSON.parse(data.SecretString);
      return this.cachedSecrets[secretArn];
    }

    throw new Error('Secret no contiene SecretString');
  }
}
