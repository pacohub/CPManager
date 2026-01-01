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
exports.ChapterFactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chapterFaction_entity_1 = require("../Entities/chapterFaction.entity");
const chapter_entity_1 = require("../Entities/chapter.entity");
let ChapterFactionService = class ChapterFactionService {
    chapterFactionRepository;
    chapterRepository;
    constructor(chapterFactionRepository, chapterRepository) {
        this.chapterFactionRepository = chapterFactionRepository;
        this.chapterRepository = chapterRepository;
    }
    normalizeNameForCompare(value) {
        return String(value ?? '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
    isCreditsChapter(chapter) {
        if (chapter?.specialType === chapter_entity_1.ChapterSpecialType.CREDITS)
            return true;
        const name = this.normalizeNameForCompare(chapter?.name);
        return name === 'creditos' || name === 'credits';
    }
    assertNotCredits(chapter) {
        if (!this.isCreditsChapter(chapter))
            return;
        throw new common_1.BadRequestException('En el capítulo Créditos no se asocian facciones');
    }
    async findByChapter(chapterId) {
        return this.chapterFactionRepository
            .createQueryBuilder('cf')
            .where('cf.chapterId = :chapterId', { chapterId })
            .orderBy('LOWER(cf.groupName)', 'ASC')
            .addOrderBy('cf.order', 'ASC')
            .addOrderBy('cf.id', 'ASC')
            .getMany();
    }
    async findByCampaign(campaignId) {
        return this.chapterFactionRepository
            .createQueryBuilder('cf')
            .innerJoin(chapter_entity_1.Chapter, 'ch', 'ch.id = cf.chapterId')
            .where('ch.campaignId = :campaignId', { campaignId })
            .orderBy('cf.chapterId', 'ASC')
            .addOrderBy('LOWER(cf.groupName)', 'ASC')
            .addOrderBy('cf.order', 'ASC')
            .addOrderBy('cf.id', 'ASC')
            .getMany();
    }
    async replaceForChapter(chapterId, links) {
        const cleaned = (links ?? [])
            .filter((l) => l && Number.isFinite(Number(l.factionId)))
            .map((l) => ({
            factionId: Number(l.factionId),
            groupName: String(l.groupName ?? '').trim() || 'Grupo',
            order: Number.isFinite(Number(l.order)) ? Number(l.order) : 0,
            isPlayable: Boolean(l.isPlayable),
            colorOverride: typeof l.colorOverride === 'string' ? l.colorOverride.trim() : null,
        }));
        if (cleaned.length > 24) {
            throw new Error('Máximo 24 facciones por capítulo');
        }
        let playableSeen = false;
        for (const l of cleaned) {
            if (!l.isPlayable)
                continue;
            if (playableSeen)
                l.isPlayable = false;
            playableSeen = true;
        }
        const chapter = await this.chapterRepository.findOneBy({ id: chapterId });
        if (!chapter)
            throw new common_1.NotFoundException('Capítulo no encontrado');
        this.assertNotCredits(chapter);
        await this.chapterFactionRepository.delete({ chapterId });
        if (cleaned.length === 0)
            return [];
        const entities = cleaned.map((l) => ({
            chapterId,
            factionId: l.factionId,
            groupName: l.groupName,
            order: l.order ?? 0,
            isPlayable: l.isPlayable,
            colorOverride: l.colorOverride ? l.colorOverride : null,
        }));
        await this.chapterFactionRepository.save(entities);
        return this.findByChapter(chapterId);
    }
    async setColorOverride(chapterId, factionId, colorOverride) {
        const chapter = await this.chapterRepository.findOneBy({ id: chapterId });
        if (!chapter)
            throw new common_1.NotFoundException('Capítulo no encontrado');
        this.assertNotCredits(chapter);
        const existing = await this.chapterFactionRepository.findOneBy({ chapterId, factionId });
        if (!existing)
            return null;
        existing.colorOverride = (colorOverride ?? '').trim() || null;
        await this.chapterFactionRepository.save(existing);
        return existing;
    }
};
exports.ChapterFactionService = ChapterFactionService;
exports.ChapterFactionService = ChapterFactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chapterFaction_entity_1.ChapterFaction)),
    __param(1, (0, typeorm_1.InjectRepository)(chapter_entity_1.Chapter)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChapterFactionService);
//# sourceMappingURL=chapterFaction.service.js.map