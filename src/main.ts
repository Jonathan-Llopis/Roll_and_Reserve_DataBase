import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Initializes and starts the NestJS application.
 * 
 * - Creates an instance of the application using AppModule.
 * - Enables CORS with specified settings.
 * - Configures Swagger for API documentation with bearer authentication.
 * - Sets up Swagger documentation at the 'api' endpoint.
 * - Listens on the specified PORT environment variable or defaults to port 3000.
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API Documentation')
    .setVersion('2.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
