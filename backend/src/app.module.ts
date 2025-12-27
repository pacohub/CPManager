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
import { Event } from './Entities/event.entity';
import { EventService } from './Services/event.service';
import { EventController } from './Controller/event.controller';
import { Mechanic } from './Entities/mechanic.entity';
import { Objective } from './Entities/objective.entity';
import { MechanicService } from './Services/mechanic.service';
import { ObjectiveService } from './Services/objective.service';
import { MechanicController } from './Controller/mechanic.controller';
import { ObjectiveController } from './Controller/objective.controller';
import { Faction } from './Entities/faction.entity';
import { FactionService } from './Services/faction.service';
import { FactionController } from './Controller/faction.controller';
import { ChapterFaction } from './Entities/chapterFaction.entity';
import { ChapterFactionService } from './Services/chapterFaction.service';
import { ChapterFactionController } from './Controller/chapterFaction.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Saga, Campaign, Chapter, Map, Event, Mechanic, Objective, Faction, ChapterFaction],
      synchronize: true, // Solo para desarrollo
    }),
    TypeOrmModule.forFeature([Saga, Campaign, Chapter, Map, Event, Mechanic, Objective, Faction, ChapterFaction]),
  ],
  controllers: [
		AppController,
		SagaController,
		CampaignController,
		ChapterController,
		MapController,
		EventController,
		MechanicController,
		ObjectiveController,
		FactionController,
    ChapterFactionController,
	],
  providers: [AppService, SagaService, CampaignService, ChapterService, MapService, EventService, MechanicService, ObjectiveService, FactionService, ChapterFactionService],
})
export class AppModule {}
