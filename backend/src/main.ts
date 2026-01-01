
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as path from 'path';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // Increase JSON/body size limit to allow small image uploads as data URLs
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ limit: '5mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Serve uploads from the project root `uploads` directory so it works
  // both when running from source and when running compiled code in `dist`.
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  // Serve backups so created zip files are accessible via HTTP
  const backupsPath = path.join(process.cwd(), 'backups');
  app.use('/backups', express.static(backupsPath));
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
