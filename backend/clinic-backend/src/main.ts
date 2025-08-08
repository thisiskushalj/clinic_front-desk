import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // ✅ Your deployed frontend URL
    credentials: true, // ✅ Needed if you're using Authorization headers (like JWT tokens)
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();