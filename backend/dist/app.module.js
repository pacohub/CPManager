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
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: 'database.sqlite',
                entities: [saga_entity_1.Saga, campaign_entity_1.Campaign, chapter_entity_1.Chapter],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([saga_entity_1.Saga, campaign_entity_1.Campaign, chapter_entity_1.Chapter]),
        ],
        controllers: [app_controller_1.AppController, saga_controller_1.SagaController, campaign_controller_1.CampaignController, chapter_controller_1.ChapterController],
        providers: [app_service_1.AppService, saga_service_1.SagaService, campaign_service_1.CampaignService, chapter_service_1.ChapterService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map