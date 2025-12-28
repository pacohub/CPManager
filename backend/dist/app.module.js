"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const saga_entity_1 = require("./Entities/saga.entity");
const saga_service_1 = require("./Services/saga.service");
const saga_controller_1 = require("./Controller/saga.controller");
const campaign_entity_1 = require("./Entities/campaign.entity");
const campaign_service_1 = require("./Services/campaign.service");
const campaign_controller_1 = require("./Controller/campaign.controller");
const chapter_entity_1 = require("./Entities/chapter.entity");
const chapter_service_1 = require("./Services/chapter.service");
const chapter_controller_1 = require("./Controller/chapter.controller");
const map_entity_1 = require("./Entities/map.entity");
const map_service_1 = require("./Services/map.service");
const map_controller_1 = require("./Controller/map.controller");
const event_entity_1 = require("./Entities/event.entity");
const event_service_1 = require("./Services/event.service");
const event_controller_1 = require("./Controller/event.controller");
const mechanic_entity_1 = require("./Entities/mechanic.entity");
const objective_entity_1 = require("./Entities/objective.entity");
const mechanic_service_1 = require("./Services/mechanic.service");
const objective_service_1 = require("./Services/objective.service");
const mechanic_controller_1 = require("./Controller/mechanic.controller");
const objective_controller_1 = require("./Controller/objective.controller");
const faction_entity_1 = require("./Entities/faction.entity");
const faction_service_1 = require("./Services/faction.service");
const faction_controller_1 = require("./Controller/faction.controller");
const chapterFaction_entity_1 = require("./Entities/chapterFaction.entity");
const chapterFaction_service_1 = require("./Services/chapterFaction.service");
const chapterFaction_controller_1 = require("./Controller/chapterFaction.controller");
const profession_entity_1 = require("./Entities/profession.entity");
const profession_service_1 = require("./Services/profession.service");
const profession_controller_1 = require("./Controller/profession.controller");
const professionObject_entity_1 = require("./Entities/professionObject.entity");
const professionObject_service_1 = require("./Services/professionObject.service");
const professionObject_controller_1 = require("./Controller/professionObject.controller");
const professionObjectResource_entity_1 = require("./Entities/professionObjectResource.entity");
const professionObjectResource_service_1 = require("./Services/professionObjectResource.service");
const professionObjectResource_controller_1 = require("./Controller/professionObjectResource.controller");
const gameObject_entity_1 = require("./Entities/gameObject.entity");
const gameObject_service_1 = require("./Services/gameObject.service");
const gameObject_controller_1 = require("./Controller/gameObject.controller");
const component_entity_1 = require("./Entities/component.entity");
const component_service_1 = require("./Services/component.service");
const component_controller_1 = require("./Controller/component.controller");
const resource_entity_1 = require("./Entities/resource.entity");
const resourceType_entity_1 = require("./Entities/resourceType.entity");
const resource_service_1 = require("./Services/resource.service");
const resourceType_service_1 = require("./Services/resourceType.service");
const resource_controller_1 = require("./Controller/resource.controller");
const resourceType_controller_1 = require("./Controller/resourceType.controller");
const class_entity_1 = require("./Entities/class.entity");
const class_service_1 = require("./Services/class.service");
const class_controller_1 = require("./Controller/class.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: 'database.sqlite',
                entities: [saga_entity_1.Saga, campaign_entity_1.Campaign, chapter_entity_1.Chapter, map_entity_1.Map, event_entity_1.Event, mechanic_entity_1.Mechanic, objective_entity_1.Objective, faction_entity_1.Faction, chapterFaction_entity_1.ChapterFaction, profession_entity_1.Profession, class_entity_1.Class, professionObject_entity_1.ProfessionObject, professionObjectResource_entity_1.ProfessionObjectResource, gameObject_entity_1.GameObject, component_entity_1.Component, resource_entity_1.Resource, resourceType_entity_1.ResourceType],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([saga_entity_1.Saga, campaign_entity_1.Campaign, chapter_entity_1.Chapter, map_entity_1.Map, event_entity_1.Event, mechanic_entity_1.Mechanic, objective_entity_1.Objective, faction_entity_1.Faction, chapterFaction_entity_1.ChapterFaction, profession_entity_1.Profession, class_entity_1.Class, professionObject_entity_1.ProfessionObject, professionObjectResource_entity_1.ProfessionObjectResource, gameObject_entity_1.GameObject, component_entity_1.Component, resource_entity_1.Resource, resourceType_entity_1.ResourceType]),
        ],
        controllers: [
            app_controller_1.AppController,
            saga_controller_1.SagaController,
            campaign_controller_1.CampaignController,
            chapter_controller_1.ChapterController,
            map_controller_1.MapController,
            event_controller_1.EventController,
            mechanic_controller_1.MechanicController,
            objective_controller_1.ObjectiveController,
            faction_controller_1.FactionController,
            chapterFaction_controller_1.ChapterFactionController,
            profession_controller_1.ProfessionController,
            professionObject_controller_1.ProfessionObjectController,
            professionObjectResource_controller_1.ProfessionObjectResourceController,
            gameObject_controller_1.GameObjectController,
            component_controller_1.ComponentController,
            resource_controller_1.ResourceController,
            resourceType_controller_1.ResourceTypeController,
            class_controller_1.ClassController,
        ],
        providers: [app_service_1.AppService, saga_service_1.SagaService, campaign_service_1.CampaignService, chapter_service_1.ChapterService, map_service_1.MapService, event_service_1.EventService, mechanic_service_1.MechanicService, objective_service_1.ObjectiveService, faction_service_1.FactionService, chapterFaction_service_1.ChapterFactionService, profession_service_1.ProfessionService, class_service_1.ClassService, professionObject_service_1.ProfessionObjectService, professionObjectResource_service_1.ProfessionObjectResourceService, gameObject_service_1.GameObjectService, component_service_1.ComponentService, resource_service_1.ResourceService, resourceType_service_1.ResourceTypeService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map