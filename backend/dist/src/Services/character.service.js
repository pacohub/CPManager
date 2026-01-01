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
exports.CharacterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const animation_entity_1 = require("../Entities/animation.entity");
const character_entity_1 = require("../Entities/character.entity");
const class_entity_1 = require("../Entities/class.entity");
const race_entity_1 = require("../Entities/race.entity");
function normalizeText(v) {
    if (typeof v !== 'string')
        return '';
    return v.trim();
}
let CharacterService = class CharacterService {
    characterRepository;
    classRepository;
    raceRepository;
    animationRepository;
    constructor(characterRepository, classRepository, raceRepository, animationRepository) {
        this.characterRepository = characterRepository;
        this.classRepository = classRepository;
        this.raceRepository = raceRepository;
        this.animationRepository = animationRepository;
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
    baseQuery() {
        return this.characterRepository
            .createQueryBuilder('character')
            .leftJoinAndSelect('character.class', 'class')
            .leftJoinAndSelect('class.animations', 'classAnimations')
            .leftJoinAndSelect('character.race', 'race')
            .leftJoinAndSelect('race.animations', 'raceAnimations')
            .leftJoinAndSelect('character.animations', 'animations');
    }
    async findAll() {
        return this.baseQuery()
            .where('character.parentId IS NULL')
            .orderBy('LOWER(character.name)', 'ASC')
            .addOrderBy('character.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.baseQuery().where('character.id = :id', { id }).getOne();
    }
    async create(data) {
        const name = normalizeText(data?.name);
        const icon = normalizeText(data?.icon) || null;
        const image = normalizeText(data?.image) || null;
        const model = normalizeText(data?.model) || null;
        const classId = Number(data?.classId);
        const raceIdRaw = data?.raceId;
        const raceId = raceIdRaw === undefined || raceIdRaw === null || String(raceIdRaw).trim() === '' ? null : Number(raceIdRaw);
        if (!name)
            throw new Error('Nombre requerido');
        if (!Number.isFinite(classId) || classId <= 0)
            throw new Error('classId requerido');
        const klass = await this.classRepository.findOneBy({ id: classId });
        if (!klass)
            throw new Error('Clase no encontrada');
        let race = null;
        if (raceId !== null) {
            if (!Number.isFinite(raceId) || raceId <= 0)
                throw new Error('raceId inválido');
            race = await this.raceRepository.findOneBy({ id: raceId });
            if (!race)
                throw new Error('Raza no encontrada');
        }
        const character = this.characterRepository.create({
            name,
            icon,
            image,
            model,
            classId: klass.id,
            class: klass,
            raceId: race ? race.id : null,
            race,
            parentId: null,
            parent: null,
        });
        return this.characterRepository.save(character);
    }
    async update(id, data) {
        const existing = await this.characterRepository.findOne({ where: { id }, relations: { animations: true } });
        if (!existing)
            return null;
        const patch = {};
        if (typeof data?.name === 'string')
            patch.name = normalizeText(data.name);
        if (typeof data?.icon === 'string')
            patch.icon = normalizeText(data.icon) || null;
        if (typeof data?.image === 'string')
            patch.image = normalizeText(data.image) || null;
        if (typeof data?.model === 'string')
            patch.model = normalizeText(data.model) || null;
        if (data?.classId !== undefined) {
            const classId = Number(data.classId);
            if (!Number.isFinite(classId) || classId <= 0)
                throw new Error('classId inválido');
            const klass = await this.classRepository.findOneBy({ id: classId });
            if (!klass)
                throw new Error('Clase no encontrada');
            patch.classId = klass.id;
            patch.class = klass;
        }
        if (data?.raceId !== undefined) {
            const raw = data.raceId;
            const nextRaceId = raw === null || String(raw).trim() === '' ? null : Number(raw);
            if (nextRaceId === null) {
                patch.raceId = null;
                patch.race = null;
            }
            else {
                if (!Number.isFinite(nextRaceId) || nextRaceId <= 0)
                    throw new Error('raceId inválido');
                const race = await this.raceRepository.findOneBy({ id: nextRaceId });
                if (!race)
                    throw new Error('Raza no encontrada');
                patch.raceId = race.id;
                patch.race = race;
            }
        }
        Object.assign(existing, patch);
        if (data?.animationIds !== undefined) {
            const ids = this.coerceIdArray(data.animationIds);
            existing.animations = ids.length ? await this.animationRepository.find({ where: { id: (0, typeorm_2.In)(ids) } }) : [];
        }
        await this.characterRepository.save(existing);
        return this.findOne(id);
    }
    async remove(id) {
        await this.characterRepository.delete(id);
    }
    async getChildren(parentId) {
        return this.baseQuery()
            .where('character.parentId = :parentId', { parentId })
            .orderBy('LOWER(character.name)', 'ASC')
            .addOrderBy('character.id', 'ASC')
            .getMany();
    }
    async createChild(parentId, data) {
        const parent = await this.characterRepository.findOne({ where: { id: parentId }, relations: { class: true } });
        if (!parent)
            throw new Error('Personaje no encontrado');
        if (parent.parentId)
            throw new Error('Las instancias no pueden tener otras instancias');
        const name = normalizeText(data?.name);
        const icon = normalizeText(data?.icon) || null;
        const image = normalizeText(data?.image) || null;
        const model = normalizeText(data?.model) || null;
        const classId = Number(data?.classId);
        const raceIdRaw = data?.raceId;
        const raceId = raceIdRaw === undefined || raceIdRaw === null || String(raceIdRaw).trim() === '' ? null : Number(raceIdRaw);
        if (!name)
            throw new Error('Nombre requerido');
        if (!Number.isFinite(classId) || classId <= 0)
            throw new Error('classId requerido');
        const klass = await this.classRepository.findOneBy({ id: classId });
        if (!klass)
            throw new Error('Clase no encontrada');
        let race = null;
        if (raceId !== null) {
            if (!Number.isFinite(raceId) || raceId <= 0)
                throw new Error('raceId inválido');
            race = await this.raceRepository.findOneBy({ id: raceId });
            if (!race)
                throw new Error('Raza no encontrada');
        }
        const child = this.characterRepository.create({
            name,
            icon,
            image,
            model,
            classId: klass.id,
            class: klass,
            raceId: race ? race.id : null,
            race,
            parentId: parent.id,
            parent,
        });
        return this.characterRepository.save(child);
    }
    async updateChild(parentId, childId, data) {
        const existing = await this.characterRepository.findOne({ where: { id: childId, parentId }, relations: { class: true, animations: true } });
        if (!existing)
            return null;
        const patch = {};
        if (typeof data?.name === 'string')
            patch.name = normalizeText(data.name);
        if (typeof data?.icon === 'string')
            patch.icon = normalizeText(data.icon) || null;
        if (typeof data?.image === 'string')
            patch.image = normalizeText(data.image) || null;
        if (typeof data?.model === 'string')
            patch.model = normalizeText(data.model) || null;
        if (data?.classId !== undefined) {
            const classId = Number(data.classId);
            if (!Number.isFinite(classId) || classId <= 0)
                throw new Error('classId inválido');
            const klass = await this.classRepository.findOneBy({ id: classId });
            if (!klass)
                throw new Error('Clase no encontrada');
            patch.classId = klass.id;
            patch.class = klass;
        }
        if (data?.raceId !== undefined) {
            const raw = data.raceId;
            const nextRaceId = raw === null || String(raw).trim() === '' ? null : Number(raw);
            if (nextRaceId === null) {
                patch.raceId = null;
                patch.race = null;
            }
            else {
                if (!Number.isFinite(nextRaceId) || nextRaceId <= 0)
                    throw new Error('raceId inválido');
                const race = await this.raceRepository.findOneBy({ id: nextRaceId });
                if (!race)
                    throw new Error('Raza no encontrada');
                patch.raceId = race.id;
                patch.race = race;
            }
        }
        Object.assign(existing, patch);
        if (data?.animationIds !== undefined) {
            const ids = this.coerceIdArray(data.animationIds);
            existing.animations = ids.length ? await this.animationRepository.find({ where: { id: (0, typeorm_2.In)(ids) } }) : [];
        }
        await this.characterRepository.save(existing);
        return this.baseQuery().where('character.id = :id AND character.parentId = :parentId', { id: childId, parentId }).getOne();
    }
    async removeChild(parentId, childId) {
        await this.characterRepository.delete({ id: childId, parentId });
    }
};
exports.CharacterService = CharacterService;
exports.CharacterService = CharacterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __param(1, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(2, (0, typeorm_1.InjectRepository)(race_entity_1.Race)),
    __param(3, (0, typeorm_1.InjectRepository)(animation_entity_1.Animation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CharacterService);
//# sourceMappingURL=character.service.js.map