import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { RateLimitGuard } from './modules/rate-limiting/rate-limit.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  // Global middleware
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.API_CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global rate limiting guard
  const rateLimitGuard = app.get(RateLimitGuard);
  app.useGlobalGuards(rateLimitGuard);

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || '/api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Context7 MCP Clone API')
    .setDescription('Up-to-date code documentation API for LLMs and AI code editors')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`Context7 MCP Clone API running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
}

bootstrap();
