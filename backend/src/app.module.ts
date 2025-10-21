import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Saga } from './Entities/saga.entity';
import { SagaService } from './Services/saga.service';
import { SagaController } from './Controller/saga.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Saga],
      synchronize: true, // Solo para desarrollo
    }),
    TypeOrmModule.forFeature([Saga]),
  ],
  controllers: [AppController, SagaController],
  providers: [AppService, SagaService],
})
export class AppModule {}
