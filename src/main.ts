import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors = []) => {
        const messages = validationErrors.map(
          (err) =>
            `${err.property} has wrong value ${err.value}, ${Object.values(
              err.constraints,
            ).join(', ')}`,
        );
        return new BadRequestException(messages);
      },
    }),
  );

  await app.listen(4000);
}
bootstrap();
