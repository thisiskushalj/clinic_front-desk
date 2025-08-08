import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for both local development and deployed frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'https://clinic-front-desk-frontend.vercel.app'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000);
}
bootstrap();