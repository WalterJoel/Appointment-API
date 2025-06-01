import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cachedServer;

export const handler = async (event, context) => {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
      .setTitle('APPOINTMENT API')
      .setDescription('RIMAC RETO TÉCNICO')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(nestApp, config);
    SwaggerModule.setup('api', nestApp, document);
    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context);
};
