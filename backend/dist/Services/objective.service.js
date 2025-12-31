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
exports.ObjectiveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("../Entities/event.entity");
const mechanic_entity_1 = require("../Entities/mechanic.entity");
const objective_entity_1 = require("../Entities/objective.entity");
let ObjectiveService = class ObjectiveService {
    objectiveRepository;
    eventRepository;
    mechanicRepository;
    constructor(objectiveRepository, eventRepository, mechanicRepository) {
        this.objectiveRepository = objectiveRepository;
        this.eventRepository = eventRepository;
        this.mechanicRepository = mechanicRepository;
    }
    normalizeText(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return '';
        return String(value).trim();
    }
    assertDifficulty(value) {
        if (value === undefined)
            return;
        const v = String(value);
        const allowed = new Set(Object.values(event_entity_1.EventDifficulty));
        if (!allowed.has(v)) {
            throw new common_1.BadRequestException(`difficulty inválido: ${v}`);
        }
    }
    toInt(value, field) {
        const n = Number(value);
        if (!Number.isFinite(n))
            throw new common_1.BadRequestException(`${field} inválido`);
        return Math.trunc(n);
    }
    isObjectiveEventType(type) {
        return (type === event_entity_1.EventType.MISSION ||
            type === event_entity_1.EventType.SECONDARY_MISSION ||
            type === event_entity_1.EventType.DAILY_MISSION ||
            type === event_entity_1.EventType.WEEKLY_MISSION);
    }
    async findAll(filters = {}) {
        const qb = this.objectiveRepository
            .createQueryBuilder('objective')
            .leftJoinAndSelect('objective.event', 'event')
            .leftJoinAndSelect('objective.mechanic', 'mechanic')
            .orderBy('objective.position', 'ASC')
            .addOrderBy('objective.id', 'ASC');
        if (filters.eventId !== undefined) {
            qb.andWhere('event.id = :eventId', { eventId: filters.eventId });
        }
        if (filters.mechanicId !== undefined) {
            qb.andWhere('mechanic.id = :mechanicId', { mechanicId: filters.mechanicId });
        }
        if (filters.chapterId !== undefined) {
            qb.leftJoin('event.chapter', 'chapter');
            qb.andWhere('chapter.id = :chapterId', { chapterId: filters.chapterId });
        }
        return qb.getMany();
    }
    async findOne(id) {
        return this.objectiveRepository.findOne({
            where: { id },
            relations: { event: true, mechanic: true },
        });
    }
    async create(data) {
        const eventId = Number(data?.eventId);
        const mechanicId = Number(data?.mechanicId);
        if (!Number.isFinite(eventId))
            throw new common_1.BadRequestException('eventId es requerido');
        if (!Number.isFinite(mechanicId))
            throw new common_1.BadRequestException('mechanicId es requerido');
        const event = await this.eventRepository.findOneBy({ id: eventId });
        if (!event)
            throw new common_1.NotFoundException('Evento no encontrado');
        if (!this.isObjectiveEventType(event.type)) {
            throw new common_1.BadRequestException('Los objetivos solo pueden pertenecer a eventos de tipo MISSION');
        }
        const mechanic = await this.mechanicRepository.findOneBy({ id: mechanicId });
        if (!mechanic)
            throw new common_1.NotFoundException('Mecánica no encontrada');
        const maxRow = await this.objectiveRepository
            .createQueryBuilder('objective')
            .select('MAX(objective.position)', 'max')
            .leftJoin('objective.event', 'event')
            .where('event.id = :eventId', { eventId })
            .getRawOne();
        const nextPosition = Math.max(0, Number(maxRow?.max ?? -1) + 1);
        const name = this.normalizeText(data?.name);
        if (!name)
            throw new common_1.BadRequestException('name es requerido');
        const difficulty = this.normalizeText(data?.difficulty);
        this.assertDifficulty(difficulty);
        const objective = this.objectiveRepository.create({
            position: data?.position !== undefined ? this.toInt(data.position, 'position') : nextPosition,
            name,
            description: this.normalizeText(data?.description) ?? '',
            detailedDescription: this.normalizeText(data?.detailedDescription) ?? '',
            difficulty: difficulty ?? event_entity_1.EventDifficulty.NORMAL,
            initialValue: data?.initialValue !== undefined ? this.toInt(data.initialValue, 'initialValue') : 0,
            difficultyIncrement: data?.difficultyIncrement !== undefined ? this.toInt(data.difficultyIncrement, 'difficultyIncrement') : 0,
            event,
            mechanic,
        });
        return this.objectiveRepository.save(objective);
    }
    async update(id, data) {
        const existing = await this.findOne(id);
        if (!existing)
            throw new common_1.NotFoundException('Objetivo no encontrado');
        if (data?.name !== undefined) {
            const name = this.normalizeText(data?.name);
            if (!name)
                throw new common_1.BadRequestException('name es requerido');
            existing.name = name;
        }
        if (data?.description !== undefined)
            existing.description = this.normalizeText(data?.description) ?? '';
        if (data?.detailedDescription !== undefined) {
            existing.detailedDescription = this.normalizeText(data?.detailedDescription) ?? '';
        }
        if (data?.difficulty !== undefined) {
            const difficulty = this.normalizeText(data?.difficulty);
            this.assertDifficulty(difficulty);
            existing.difficulty = difficulty;
        }
        if (data?.initialValue !== undefined) {
            existing.initialValue = this.toInt(data.initialValue, 'initialValue');
        }
        if (data?.difficultyIncrement !== undefined) {
            existing.difficultyIncrement = this.toInt(data.difficultyIncrement, 'difficultyIncrement');
        }
        if (data?.position !== undefined) {
            existing.position = this.toInt(data.position, 'position');
        }
        if (data?.eventId !== undefined) {
            const eventId = Number(data.eventId);
            if (!Number.isFinite(eventId))
                throw new common_1.BadRequestException('eventId inválido');
            const event = await this.eventRepository.findOneBy({ id: eventId });
            if (!event)
                throw new common_1.NotFoundException('Evento no encontrado');
            if (!this.isObjectiveEventType(event.type)) {
                throw new common_1.BadRequestException('Los objetivos solo pueden pertenecer a eventos de tipo MISSION');
            }
            existing.event = event;
        }
        if (data?.mechanicId !== undefined) {
            const mechanicId = Number(data.mechanicId);
            if (!Number.isFinite(mechanicId))
                throw new common_1.BadRequestException('mechanicId inválido');
            const mechanic = await this.mechanicRepository.findOneBy({ id: mechanicId });
            if (!mechanic)
                throw new common_1.NotFoundException('Mecánica no encontrada');
            existing.mechanic = mechanic;
        }
        return this.objectiveRepository.save(existing);
    }
    async remove(id) {
        await this.objectiveRepository.delete(id);
    }
};
exports.ObjectiveService = ObjectiveService;
exports.ObjectiveService = ObjectiveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(objective_entity_1.Objective)),
    __param(1, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(2, (0, typeorm_1.InjectRepository)(mechanic_entity_1.Mechanic)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ObjectiveService);
//# sourceMappingURL=objective.service.js.map