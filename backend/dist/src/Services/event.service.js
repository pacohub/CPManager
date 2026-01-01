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
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chapter_entity_1 = require("../Entities/chapter.entity");
const event_entity_1 = require("../Entities/event.entity");
const map_entity_1 = require("../Entities/map.entity");
let EventService = class EventService {
    eventRepository;
    chapterRepository;
    mapRepository;
    constructor(eventRepository, chapterRepository, mapRepository) {
        this.eventRepository = eventRepository;
        this.chapterRepository = chapterRepository;
        this.mapRepository = mapRepository;
    }
    normalizeText(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return '';
        return String(value).trim();
    }
    assertEnumValue(enumObj, value, field) {
        if (value === undefined)
            return;
        const v = String(value);
        const allowed = new Set(Object.values(enumObj));
        if (!allowed.has(v)) {
            throw new common_1.BadRequestException(`Campo ${field} inválido: ${v}`);
        }
    }
    normalizeNameForCompare(value) {
        return String(value ?? '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
    coerceIdArray(value) {
        if (!Array.isArray(value))
            return [];
        const out = [];
        const seen = new Set();
        for (const raw of value) {
            const n = Number.parseInt(String(raw), 10);
            if (!Number.isFinite(n) || n <= 0)
                continue;
            if (seen.has(n))
                continue;
            seen.add(n);
            out.push(n);
        }
        return out;
    }
    normalizeMoba(value) {
        const normalizeTeamName = (raw, fallback) => {
            const t = String(raw ?? '').trim();
            return t || fallback;
        };
        if (Array.isArray(value?.teams)) {
            const teams = [];
            for (let i = 0; i < value.teams.length; i++) {
                const t = value.teams[i];
                if (!t || typeof t !== 'object')
                    continue;
                const name = normalizeTeamName(t.name, `Equipo ${teams.length + 1}`);
                const factionIds = this.coerceIdArray(t.factionIds ?? t.ids ?? []);
                teams.push({ name, factionIds });
            }
            if (teams.length === 0) {
                teams.push({ name: 'Equipo A', factionIds: [] }, { name: 'Equipo B', factionIds: [] });
            }
            else if (teams.length === 1) {
                teams.push({ name: 'Equipo B', factionIds: [] });
            }
            return { teams };
        }
        const teamAIds = this.coerceIdArray(value?.teamAIds ?? value?.teamA ?? value?.a ?? []);
        const teamBIds = this.coerceIdArray(value?.teamBIds ?? value?.teamB ?? value?.b ?? []);
        return {
            teams: [
                { name: 'Equipo A', factionIds: teamAIds },
                { name: 'Equipo B', factionIds: teamBIds },
            ],
        };
    }
    normalizeDialogue(value) {
        const rawLines = Array.isArray(value?.lines)
            ? value.lines
            : Array.isArray(value)
                ? value
                : [];
        const lines = [];
        for (const raw of rawLines) {
            if (!raw || typeof raw !== 'object')
                continue;
            const speaker = this.normalizeText(raw.speaker) ?? '';
            const text = this.normalizeText(raw.text) ?? '';
            if (!speaker && !text)
                continue;
            lines.push({ speaker: speaker || undefined, text });
        }
        return { lines };
    }
    isCreditsChapter(chapter) {
        if (chapter?.specialType === chapter_entity_1.ChapterSpecialType.CREDITS)
            return true;
        const name = this.normalizeNameForCompare(chapter?.name);
        return name === 'creditos' || name === 'credits';
    }
    assertCreditsAllowsType(chapter, type) {
        if (!this.isCreditsChapter(chapter))
            return;
        if (type !== event_entity_1.EventType.CINEMATIC) {
            throw new common_1.BadRequestException('En el capítulo Créditos solo se permiten eventos de tipo CINEMATIC');
        }
    }
    async findAll(filters = {}) {
        const qb = this.eventRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.chapter', 'chapter')
            .leftJoinAndSelect('event.map', 'map')
            .orderBy('event.position', 'ASC')
            .addOrderBy('event.id', 'ASC');
        if (filters.chapterId !== undefined) {
            qb.andWhere('chapter.id = :chapterId', { chapterId: filters.chapterId });
        }
        if (filters.mapId !== undefined) {
            qb.andWhere('map.id = :mapId', { mapId: filters.mapId });
        }
        return qb.getMany();
    }
    async getNextPositionForChapter(chapterId) {
        const row = await this.eventRepository
            .createQueryBuilder('event')
            .leftJoin('event.chapter', 'chapter')
            .select('MAX(event.position)', 'max')
            .where('chapter.id = :chapterId', { chapterId })
            .getRawOne();
        const max = row?.max === null || row?.max === undefined ? -1 : Number(row.max);
        return Number.isFinite(max) ? max + 1 : 0;
    }
    async findOne(id) {
        return this.eventRepository.findOne({
            where: { id },
            relations: { chapter: true, map: true },
        });
    }
    async create(data) {
        const chapterId = Number(data?.chapterId);
        const mapId = Number(data?.mapId);
        if (!Number.isFinite(chapterId))
            throw new common_1.BadRequestException('chapterId es requerido');
        if (!Number.isFinite(mapId))
            throw new common_1.BadRequestException('mapId es requerido');
        const chapter = await this.chapterRepository.findOneBy({ id: chapterId });
        if (!chapter)
            throw new common_1.NotFoundException('Capítulo no encontrado');
        const map = await this.mapRepository.findOneBy({ id: mapId });
        if (!map)
            throw new common_1.NotFoundException('Mapa no encontrado');
        const name = this.normalizeText(data?.name);
        if (!name)
            throw new common_1.BadRequestException('name es requerido');
        const type = this.normalizeText(data?.type);
        const difficulty = this.normalizeText(data?.difficulty);
        this.assertEnumValue(event_entity_1.EventType, type, 'type');
        this.assertEnumValue(event_entity_1.EventDifficulty, difficulty, 'difficulty');
        const resolvedType = type ?? event_entity_1.EventType.MISSION;
        this.assertCreditsAllowsType(chapter, resolvedType);
        const nextPosition = await this.getNextPositionForChapter(chapterId);
        const event = this.eventRepository.create({
            position: nextPosition,
            name,
            description: this.normalizeText(data?.description) ?? '',
            type: resolvedType,
            difficulty: difficulty ?? event_entity_1.EventDifficulty.NORMAL,
            file: this.normalizeText(data?.file) ?? '',
            moba: resolvedType === event_entity_1.EventType.MOBA ? this.normalizeMoba(data?.moba) : null,
            dialogue: data?.dialogue === undefined ? null : data?.dialogue === null ? null : this.normalizeDialogue(data?.dialogue),
            chapter,
            map,
        });
        return this.eventRepository.save(event);
    }
    async update(id, data) {
        const existing = await this.findOne(id);
        if (!existing)
            throw new common_1.NotFoundException('Evento no encontrado');
        let nextChapter = existing.chapter;
        let nextType = existing.type;
        if (data?.position !== undefined) {
            const position = Number(data.position);
            if (!Number.isFinite(position) || position < 0)
                throw new common_1.BadRequestException('position inválido');
            existing.position = Math.trunc(position);
        }
        if (data?.name !== undefined) {
            const next = this.normalizeText(data?.name);
            if (!next)
                throw new common_1.BadRequestException('name es requerido');
            existing.name = next;
        }
        if (data?.description !== undefined)
            existing.description = this.normalizeText(data?.description) ?? '';
        if (data?.file !== undefined)
            existing.file = this.normalizeText(data?.file) ?? '';
        if (data?.type !== undefined) {
            const t = this.normalizeText(data?.type);
            this.assertEnumValue(event_entity_1.EventType, t, 'type');
            nextType = t;
        }
        if (data?.difficulty !== undefined) {
            const d = this.normalizeText(data?.difficulty);
            this.assertEnumValue(event_entity_1.EventDifficulty, d, 'difficulty');
            existing.difficulty = d;
        }
        if (data?.chapterId !== undefined) {
            const chapterId = Number(data.chapterId);
            if (!Number.isFinite(chapterId))
                throw new common_1.BadRequestException('chapterId inválido');
            const chapter = await this.chapterRepository.findOneBy({ id: chapterId });
            if (!chapter)
                throw new common_1.NotFoundException('Capítulo no encontrado');
            nextChapter = chapter;
        }
        this.assertCreditsAllowsType(nextChapter, nextType);
        existing.type = nextType;
        existing.chapter = nextChapter;
        if (data?.moba !== undefined) {
            existing.moba = nextType === event_entity_1.EventType.MOBA ? this.normalizeMoba(data.moba) : null;
        }
        else if (nextType !== event_entity_1.EventType.MOBA) {
            existing.moba = null;
        }
        if (data?.dialogue !== undefined) {
            existing.dialogue = data.dialogue === null ? null : this.normalizeDialogue(data.dialogue);
        }
        if (data?.mapId !== undefined) {
            const mapId = Number(data.mapId);
            if (!Number.isFinite(mapId))
                throw new common_1.BadRequestException('mapId inválido');
            const map = await this.mapRepository.findOneBy({ id: mapId });
            if (!map)
                throw new common_1.NotFoundException('Mapa no encontrado');
            existing.map = map;
        }
        return this.eventRepository.save(existing);
    }
    async remove(id) {
        await this.eventRepository.delete(id);
    }
    async countByChapterForCampaign(campaignId) {
        const rows = await this.eventRepository
            .createQueryBuilder('event')
            .leftJoin('event.chapter', 'chapter')
            .select('chapter.id', 'chapterId')
            .addSelect('COUNT(event.id)', 'count')
            .addSelect("SUM(CASE WHEN event.type IN ('MISSION','SECONDARY_MISSION','DAILY_MISSION','WEEKLY_MISSION','MOBA') THEN 1 ELSE 0 END)", 'missionCount')
            .addSelect("SUM(CASE WHEN event.type = 'CINEMATIC' THEN 1 ELSE 0 END)", 'cinematicCount')
            .addSelect("SUM(CASE WHEN event.description IS NULL OR TRIM(event.description) = '' THEN 1 ELSE 0 END)", 'warningCount')
            .where('chapter.campaignId = :campaignId', { campaignId })
            .groupBy('chapter.id')
            .getRawMany();
        return (rows ?? []).map((r) => ({
            chapterId: Number(r.chapterId),
            count: Number(r.count),
            warningCount: Number(r.warningCount ?? 0),
            missionCount: Number(r.missionCount ?? 0),
            cinematicCount: Number(r.cinematicCount ?? 0),
        }));
    }
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(chapter_entity_1.Chapter)),
    __param(2, (0, typeorm_1.InjectRepository)(map_entity_1.Map)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EventService);
//# sourceMappingURL=event.service.js.map