"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameObjectService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const campaign_entity_1 = require("../Entities/campaign.entity");
const gameObject_entity_1 = require("../Entities/gameObject.entity");
let GameObjectService = class GameObjectService {
    gameObjectRepository;
    campaignRepository;
    constructor(gameObjectRepository, campaignRepository) {
        this.gameObjectRepository = gameObjectRepository;
        this.campaignRepository = campaignRepository;
    }
    normalizeText(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return '';
        return String(value).trim();
    }
    async findAll() {
        return this.gameObjectRepository
            .createQueryBuilder('obj')
            .orderBy('LOWER(obj.name)', 'ASC')
            .addOrderBy('obj.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.gameObjectRepository.findOneBy({ id });
    }
    async create(data) {
        const name = this.normalizeText(data?.name);
        if (!name)
            throw new common_1.BadRequestException('name es requerido');
        const obj = this.gameObjectRepository.create({
            name,
            icon: this.normalizeText(data?.icon) ?? '',
            description: this.normalizeText(data?.description) ?? '',
            fileLink: this.normalizeText(data?.fileLink) ?? '',
        });
        return this.gameObjectRepository.save(obj);
    }
    async update(id, data) {
        const patch = {};
        if (data?.name !== undefined) {
            const name = this.normalizeText(data?.name);
            if (!name)
                throw new common_1.BadRequestException('name es requerido');
            patch.name = name;
        }
        if (data?.icon !== undefined)
            patch.icon = this.normalizeText(data?.icon) ?? '';
        if (data?.description !== undefined)
            patch.description = this.normalizeText(data?.description) ?? '';
        if (data?.fileLink !== undefined)
            patch.fileLink = this.normalizeText(data?.fileLink) ?? '';
        await this.gameObjectRepository.update(id, patch);
        return this.findOne(id);
    }
    async remove(id) {
        await this.gameObjectRepository.delete(id);
    }
    async getCampaigns(objectId) {
        const obj = await this.gameObjectRepository.findOne({
            where: { id: objectId },
            relations: { campaigns: true },
        });
        if (!obj)
            throw new common_1.NotFoundException('Objeto no encontrado');
        return obj.campaigns ?? [];
    }
    async setCampaignIds(objectId, campaignIds) {
        const obj = await this.gameObjectRepository.findOne({
            where: { id: objectId },
            relations: { campaigns: true },
        });
        if (!obj)
            throw new common_1.NotFoundException('Objeto no encontrado');
        const uniqueIds = Array.from(new Set((campaignIds ?? []).map((x) => Number(x)).filter((x) => Number.isFinite(x))));
        const campaigns = uniqueIds.length
            ? await this.campaignRepository.findBy({ id: (0, typeorm_2.In)(uniqueIds) })
            : [];
        obj.campaigns = campaigns;
        return this.gameObjectRepository.save(obj);
    }
};
exports.GameObjectService = GameObjectService;
exports.GameObjectService = GameObjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gameObject_entity_1.GameObject)),
    __param(1, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GameObjectService);
//# sourceMappingURL=gameObject.service.js.map