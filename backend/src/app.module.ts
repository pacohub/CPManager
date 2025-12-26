import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Saga } from './Entities/saga.entity';
import { SagaService } from './Services/saga.service';
import { SagaController } from './Controller/saga.controller';
import { Campaign } from './Entities/campaign.entity';
import { CampaignService } from './Services/campaign.service';
import { CampaignController } from './Controller/campaign.controller';
import { Chapter } from './Entities/chapter.entity';
import { ChapterService } from './Services/chapter.service';
import { ChapterController } from './Controller/chapter.controller';
import { Map } from './Entities/map.entity';
import { MapService } from './Services/map.service';
import { MapController } from './Controller/map.controller';
import { Region } from './Entities/region.entity';
import { RegionService } from './Services/region.service';
import { RegionController } from './Controller/region.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Saga, Campaign, Chapter, Map, Region],
      synchronize: true, // Solo para desarrollo
    }),
    TypeOrmModule.forFeature([Saga, Campaign, Chapter, Map, Region]),
  ],
  controllers: [AppController, SagaController, CampaignController, ChapterController, MapController, RegionController],
  providers: [AppService, SagaService, CampaignService, ChapterService, MapService, RegionService],
})
export class AppModule {}
