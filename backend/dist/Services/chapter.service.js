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
exports.ChapterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chapter_entity_1 = require("../Entities/chapter.entity");
const campaign_entity_1 = require("../Entities/campaign.entity");
let ChapterService = class ChapterService {
    chapterRepository;
    campaignRepository;
    constructor(chapterRepository, campaignRepository) {
        this.chapterRepository = chapterRepository;
        this.campaignRepository = campaignRepository;
    }
    async findAll() {
        return this.chapterRepository.find({ order: { id: 'ASC' } });
    }
    async findDuplicateByName(name, excludeId) {
        const normalized = (name ?? '').trim().toLowerCase();
        if (!normalized)
            return null;
        const qb = this.chapterRepository
            .createQueryBuilder('chapter')
            .where('TRIM(LOWER(chapter.name)) = :name', { name: normalized });
        if (excludeId !== undefined) {
            qb.andWhere('chapter.id != :excludeId', { excludeId });
        }
        return qb.getOne();
    }
    async assertUniqueName(name, excludeId) {
        if (name === undefined)
            return;
        const dup = await this.findDuplicateByName(name, excludeId);
        if (!dup)
            return;
        const campaign = await this.campaignRepository.findOneBy({ id: dup.campaignId });
        const campaignName = campaign?.name ?? String(dup.campaignId);
        throw new common_1.BadRequestException(`La campaña ${campaignName} tiene un capítulo con ese nombre`);
    }
    async findAllByCampaign(campaignId) {
        return this.chapterRepository.find({ where: { campaignId }, order: { order: 'ASC', id: 'ASC' } });
    }
    async findOne(id) {
        return this.chapterRepository.findOneBy({ id });
    }
    async create(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        await this.assertUniqueName(data.name);
        if (data.order === undefined && data.campaignId !== undefined) {
            const raw = await this.chapterRepository
                .createQueryBuilder('chapter')
                .select('MAX(chapter.order)', 'max')
                .where('chapter.campaignId = :campaignId', { campaignId: data.campaignId })
                .getRawOne();
            const maxOrder = raw?.max === null || raw?.max === undefined ? -1 : Number(raw.max);
            data.order = Number.isFinite(maxOrder) ? maxOrder + 1 : 0;
        }
        const chapter = this.chapterRepository.create(data);
        return this.chapterRepository.save(chapter);
    }
    async update(id, data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        await this.assertUniqueName(data.name, id);
        await this.chapterRepository.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.chapterRepository.delete(id);
    }
};
exports.ChapterService = ChapterService;
exports.ChapterService = ChapterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chapter_entity_1.Chapter)),
    __param(1, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChapterService);
//# sourceMappingURL=chapter.service.js.map