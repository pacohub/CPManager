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
var ChapterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chapter_entity_1 = require("../Entities/chapter.entity");
const campaign_entity_1 = require("../Entities/campaign.entity");
const resource_entity_1 = require("../Entities/resource.entity");
let ChapterService = class ChapterService {
    static { ChapterService_1 = this; }
    chapterRepository;
    campaignRepository;
    resourceRepository;
    constructor(chapterRepository, campaignRepository, resourceRepository) {
        this.chapterRepository = chapterRepository;
        this.campaignRepository = campaignRepository;
        this.resourceRepository = resourceRepository;
    }
    async findAll() {
        return this.chapterRepository.find({ order: { id: 'ASC' } });
    }
    async findDuplicateByName(campaignId, name, excludeId) {
        const normalized = (name ?? '').trim().toLowerCase();
        if (!normalized)
            return null;
        const qb = this.chapterRepository
            .createQueryBuilder('chapter')
            .where('chapter.campaignId = :campaignId', { campaignId })
            .andWhere('TRIM(LOWER(chapter.name)) = :name', { name: normalized });
        if (excludeId !== undefined) {
            qb.andWhere('chapter.id != :excludeId', { excludeId });
        }
        return qb.getOne();
    }
    async assertUniqueName(name, campaignId, excludeId) {
        if (name === undefined)
            return;
        const dup = await this.findDuplicateByName(campaignId, name, excludeId);
        if (!dup)
            return;
        const campaign = await this.campaignRepository.findOneBy({ id: campaignId });
        const campaignName = campaign?.name ?? String(campaignId);
        throw new common_1.BadRequestException(`La campaña ${campaignName} tiene un capítulo con ese nombre`);
    }
    static CREDITS_NAME = 'Créditos';
    normalizeName(value) {
        return String(value ?? '').trim();
    }
    isCreditsName(name) {
        const n = this.normalizeName(name).toLowerCase();
        return n === 'créditos' || n === 'creditos';
    }
    async ensureCreditsChapterForCampaign(campaignId) {
        const existing = await this.chapterRepository.find({ where: { campaignId }, order: { order: 'ASC', id: 'ASC' } });
        let credits = existing.find((c) => c.specialType === chapter_entity_1.ChapterSpecialType.CREDITS)
            ?? existing.find((c) => this.isCreditsName(c.name));
        const nonCredits = existing.filter((c) => c.id !== credits?.id);
        const maxNonCreditsOrder = nonCredits.length
            ? Math.max(...nonCredits.map((c) => Number.isFinite(Number(c.order)) ? Number(c.order) : 0))
            : -1;
        const desiredOrder = maxNonCreditsOrder + 1;
        if (!credits) {
            credits = this.chapterRepository.create({
                campaignId,
                name: ChapterService_1.CREDITS_NAME,
                order: desiredOrder,
                description: '',
                image: '',
                file: '',
                specialType: chapter_entity_1.ChapterSpecialType.CREDITS,
            });
            return this.chapterRepository.save(credits);
        }
        const patch = {};
        if (credits.specialType !== chapter_entity_1.ChapterSpecialType.CREDITS)
            patch.specialType = chapter_entity_1.ChapterSpecialType.CREDITS;
        if (credits.name !== ChapterService_1.CREDITS_NAME)
            patch.name = ChapterService_1.CREDITS_NAME;
        if (credits.order !== desiredOrder)
            patch.order = desiredOrder;
        if (Object.keys(patch).length === 0)
            return credits;
        await this.chapterRepository.update(credits.id, patch);
        return (await this.findOne(credits.id));
    }
    async findAllByCampaign(campaignId) {
        if (!Number.isFinite(campaignId))
            return [];
        await this.ensureCreditsChapterForCampaign(campaignId);
        return this.chapterRepository.find({ where: { campaignId }, order: { order: 'ASC', id: 'ASC' } });
    }
    async findOne(id) {
        return this.chapterRepository.findOneBy({ id });
    }
    async create(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (!Number.isFinite(Number(data.campaignId)))
            throw new common_1.BadRequestException('campaignId es requerido');
        const campaignId = Number(data.campaignId);
        if (this.isCreditsName(data.name) || data.specialType === chapter_entity_1.ChapterSpecialType.CREDITS) {
            throw new common_1.BadRequestException('El capítulo Créditos se gestiona automáticamente');
        }
        const credits = await this.ensureCreditsChapterForCampaign(campaignId);
        await this.assertUniqueName(data.name, campaignId);
        let desiredOrder = data.order === undefined ? credits.order : Number(data.order);
        if (!Number.isFinite(desiredOrder) || desiredOrder < 0)
            desiredOrder = credits.order;
        if (desiredOrder >= credits.order)
            desiredOrder = credits.order;
        data.order = desiredOrder;
        await this.chapterRepository.update(credits.id, { order: credits.order + 1 });
        const chapter = this.chapterRepository.create({
            ...data,
            campaignId,
            specialType: null,
        });
        return this.chapterRepository.save(chapter);
    }
    async update(id, data) {
        const existing = await this.findOne(id);
        if (!existing)
            return null;
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (existing.specialType === chapter_entity_1.ChapterSpecialType.CREDITS || this.isCreditsName(existing.name)) {
            delete data.name;
            delete data.order;
            delete data.campaignId;
            delete data.specialType;
        }
        else {
            const campaignId = existing.campaignId;
            await this.assertUniqueName(data.name, campaignId, id);
            if (data.name !== undefined && this.isCreditsName(data.name)) {
                throw new common_1.BadRequestException('El capítulo Créditos se gestiona automáticamente');
            }
        }
        await this.chapterRepository.update(id, data);
        if (Number.isFinite(existing.campaignId)) {
            await this.ensureCreditsChapterForCampaign(existing.campaignId);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const existing = await this.findOne(id);
        if (!existing)
            return;
        if (existing.specialType === chapter_entity_1.ChapterSpecialType.CREDITS || this.isCreditsName(existing.name)) {
            throw new common_1.BadRequestException('No se puede eliminar el capítulo Créditos');
        }
        await this.chapterRepository.delete(id);
        if (Number.isFinite(existing.campaignId)) {
            await this.ensureCreditsChapterForCampaign(existing.campaignId);
        }
    }
    async getResources(chapterId) {
        const chapter = await this.chapterRepository.findOne({ where: { id: chapterId }, relations: { resources: true } });
        return chapter?.resources ?? [];
    }
    async setResourceIds(chapterId, resourceIds) {
        const chapter = await this.chapterRepository.findOne({ where: { id: chapterId }, relations: { resources: true } });
        if (!chapter)
            throw new common_1.BadRequestException('Capítulo no encontrado');
        const ids = (resourceIds || []).map(Number).filter((n) => Number.isFinite(n));
        const resources = ids.length ? await this.resourceRepository.findBy({ id: (0, typeorm_2.In)(ids) }) : [];
        chapter.resources = resources;
        return this.chapterRepository.save(chapter);
    }
};
exports.ChapterService = ChapterService;
exports.ChapterService = ChapterService = ChapterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chapter_entity_1.Chapter)),
    __param(1, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __param(2, (0, typeorm_1.InjectRepository)(resource_entity_1.Resource)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChapterService);
//# sourceMappingURL=chapter.service.js.map