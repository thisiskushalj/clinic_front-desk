import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express'; // ✅ FIXED

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: ['http://localhost:3000', 'https://clinic-front-desk-frontend.vercel.app'], // ✅ allow origins or use array
    credentials: true,
  });

  await app.init(); // ✅ no .listen() here
}

bootstrap();

export default server;