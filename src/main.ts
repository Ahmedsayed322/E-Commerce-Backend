import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
const port = Number(process.env.PORT ?? 3000);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors) => {
        const formattedErrors = Object.fromEntries(
          errors.map((err) => [
            err.property,
            err.constraints ? Object.values(err.constraints) : [],
          ]),
        );
        return new BadRequestException({
          message: 'Validation Error',
          statusCode: HttpStatus.BAD_REQUEST,
          errors: formattedErrors,
        });
      },
    }),
  );
  await app.listen(port, () => {
    console.log('server is running '+port);
  });
}
bootstrap();
