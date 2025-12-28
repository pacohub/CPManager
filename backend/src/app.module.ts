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
import { Profession } from './Entities/profession.entity';
import { ProfessionService } from './Services/profession.service';
import { ProfessionController } from './Controller/profession.controller';
import { ProfessionObject } from './Entities/professionObject.entity';
import { ProfessionObjectService } from './Services/professionObject.service';
import { ProfessionObjectController } from './Controller/professionObject.controller';
import { ProfessionObjectResource } from './Entities/professionObjectResource.entity';
import { ProfessionObjectResourceService } from './Services/professionObjectResource.service';
import { ProfessionObjectResourceController } from './Controller/professionObjectResource.controller';
import { GameObject } from './Entities/gameObject.entity';
import { GameObjectService } from './Services/gameObject.service';
import { GameObjectController } from './Controller/gameObject.controller';
import { Component } from './Entities/component.entity';
import { ComponentService } from './Services/component.service';
import { ComponentController } from './Controller/component.controller';
import { Resource } from './Entities/resource.entity';
import { ResourceType } from './Entities/resourceType.entity';
import { ResourceService } from './Services/resource.service';
import { ResourceTypeService } from './Services/resourceType.service';
import { ResourceController } from './Controller/resource.controller';
import { ResourceTypeController } from './Controller/resourceType.controller';
import { Class } from './Entities/class.entity';
import { ClassService } from './Services/class.service';
import { ClassController } from './Controller/class.controller';
import { Character } from './Entities/character.entity';
import { CharacterService } from './Services/character.service';
import { CharacterController } from './Controller/character.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
			entities: [Saga, Campaign, Chapter, Map, Event, Mechanic, Objective, Faction, ChapterFaction, Profession, Class, Character, ProfessionObject, ProfessionObjectResource, GameObject, Component, Resource, ResourceType],
      synchronize: true, // Solo para desarrollo
    }),
		TypeOrmModule.forFeature([Saga, Campaign, Chapter, Map, Event, Mechanic, Objective, Faction, ChapterFaction, Profession, Class, Character, ProfessionObject, ProfessionObjectResource, GameObject, Component, Resource, ResourceType]),
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
		ProfessionController,
		ProfessionObjectController,
		ProfessionObjectResourceController,
    GameObjectController,
		ComponentController,
		ResourceController,
		ResourceTypeController,
		ClassController,
		CharacterController,
	],
	providers: [AppService, SagaService, CampaignService, ChapterService, MapService, EventService, MechanicService, ObjectiveService, FactionService, ChapterFactionService, ProfessionService, ClassService, CharacterService, ProfessionObjectService, ProfessionObjectResourceService, GameObjectService, ComponentService, ResourceService, ResourceTypeService],
})
export class AppModule {}
