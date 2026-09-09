import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Normalize double slashes in URL paths (e.g., //siswa -> /siswa)
  app.use((req: any, res: any, next: any) => {
    const [path, query] = req.url.split('?');
    const normalizedPath = path.replace(/\/\/+/g, '/');
    req.url = query ? `${normalizedPath}?${query}` : normalizedPath;
    next();
  });

  // Set global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Set global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((err) => {
          const constraints = Object.values(err.constraints || {});
          // format: "field: message"
          return constraints.map((msg) => `${err.property}: ${msg}`);
        });
        return new BadRequestException(messages.join('|'));
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true, // Matches Ktor's anyHost()
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = parseInt(configService.get<string>('APP_PORT', '8000'), 10);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
