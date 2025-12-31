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
exports.RaceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const animation_entity_1 = require("../Entities/animation.entity");
const armorType_entity_1 = require("../Entities/armorType.entity");
const race_entity_1 = require("../Entities/race.entity");
const sound_entity_1 = require("../Entities/sound.entity");
let RaceService = class RaceService {
    raceRepository;
    armorTypeRepository;
    soundRepository;
    animationRepository;
    constructor(raceRepository, armorTypeRepository, soundRepository, animationRepository) {
        this.raceRepository = raceRepository;
        this.armorTypeRepository = armorTypeRepository;
        this.soundRepository = soundRepository;
        this.animationRepository = animationRepository;
    }
    async resolveArmorTypeId(data) {
        if (data?.armorTypeId !== undefined) {
            const raw = data.armorTypeId;
            if (raw === null || raw === '')
                return null;
            const n = Number.parseInt(String(raw), 10);
            if (!Number.isFinite(n) || n <= 0)
                throw new common_1.BadRequestException('armorTypeId inválido');
            const exists = await this.armorTypeRepository.findOneBy({ id: n });
            if (!exists)
                throw new common_1.BadRequestException('armorTypeId inválido');
            return n;
        }
        const legacy = String(data?.armorType ?? '').trim();
        if (!legacy)
            return undefined;
        const found = await this.armorTypeRepository
            .createQueryBuilder('a')
            .where('LOWER(a.name) = LOWER(:name)', { name: legacy })
            .getOne();
        if (found)
            return found.id;
        throw new common_1.BadRequestException('armorType inválido');
    }
    async ensureAnimationsExistByName(names) {
        const unique = Array.from(new Set((names || []).map((x) => String(x || '').trim()).filter(Boolean)));
        if (unique.length === 0)
            return [];
        const existing = await this.animationRepository.find({ where: { name: (0, typeorm_2.In)(unique) } });
        const existingNames = new Set((existing || []).map((a) => a.name));
        const missing = unique.filter((n) => !existingNames.has(n));
        if (missing.length === 0)
            return existing;
        const created = await this.animationRepository.save(missing.map((name) => this.animationRepository.create({ name })));
        return [...existing, ...(created || [])];
    }
    async resolveDefaultAnimationsForRace(data) {
        const names = ['Stand', 'Die'];
        const deathType = String(data?.deathType ?? '').trim();
        const movementType = String(data?.movementType ?? '').trim();
        if (deathType === 'revive, se pudre' || deathType === 'no revive, se pudre')
            names.push('Decay');
        if (movementType && movementType !== 'ninguno')
            names.push('Walk');
        return this.ensureAnimationsExistByName(names);
    }
    async findAll() {
        return this.raceRepository
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.movementSound', 'ms')
            .leftJoinAndSelect('ms.types', 'mst')
            .leftJoinAndSelect('r.armorTypeEntity', 'at')
            .leftJoinAndSelect('r.animations', 'a')
            .orderBy('LOWER(r.name)', 'ASC')
            .addOrderBy('r.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.raceRepository.findOne({
            where: { id },
            relations: { movementSound: { types: true }, armorTypeEntity: true, animations: true },
        });
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
    normalize(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        for (const key of ['icon', 'deathType', 'movementType', 'attack1', 'attack2', 'defenseType', 'armorType']) {
            const v = data[key];
            if (typeof v === 'string')
                data[key] = v.trim();
        }
    }
    validateEnums(data) {
        if (data.deathType !== undefined && data.deathType !== null) {
            if (!race_entity_1.RACE_DEATH_TYPES.includes(data.deathType)) {
                throw new common_1.BadRequestException(`deathType inválido. Debe ser uno de: ${race_entity_1.RACE_DEATH_TYPES.join(' | ')}`);
            }
        }
        if (data.movementType !== undefined && data.movementType !== null) {
            if (!race_entity_1.RACE_MOVEMENT_TYPES.includes(data.movementType)) {
                throw new common_1.BadRequestException(`movementType inválido. Debe ser uno de: ${race_entity_1.RACE_MOVEMENT_TYPES.join(' | ')}`);
            }
        }
    }
    coerceNumbers(data) {
        const intFields = ['baseDefense', 'movementSpeed', 'baseLife', 'baseMana', 'initialMana', 'transportSize'];
        for (const k of intFields) {
            if (data[k] !== undefined && data[k] !== null && data[k] !== '')
                data[k] = Number.parseInt(String(data[k]), 10);
        }
        const floatFields = ['lifeRegen', 'baseManaRegen'];
        for (const k of floatFields) {
            if (data[k] !== undefined && data[k] !== null && data[k] !== '')
                data[k] = Number.parseFloat(String(data[k]));
        }
        if (data.movementSoundId !== undefined) {
            const v = data.movementSoundId;
            data.movementSoundId = v === null || v === '' ? null : Number.parseInt(String(v), 10);
        }
        if (data.armorTypeId !== undefined) {
            const v = data.armorTypeId;
            data.armorTypeId = v === null || v === '' ? null : Number.parseInt(String(v), 10);
        }
    }
    async ensureSoundExists(soundId) {
        if (!soundId)
            return;
        const s = await this.soundRepository.findOne({ where: { id: soundId }, relations: { types: true } });
        if (!s)
            throw new common_1.BadRequestException('movementSoundId inválido');
    }
    async create(data) {
        this.coerceNumbers(data);
        this.normalize(data);
        this.validateEnums(data);
        if (!data.name)
            throw new common_1.BadRequestException('name es requerido');
        await this.ensureSoundExists(data.movementSoundId ?? null);
        const resolvedArmorTypeId = await this.resolveArmorTypeId(data);
        const entity = this.raceRepository.create(data);
        if (resolvedArmorTypeId !== undefined) {
            entity.armorTypeId = resolvedArmorTypeId;
            entity.armorTypeEntity = resolvedArmorTypeId ? await this.armorTypeRepository.findOneBy({ id: resolvedArmorTypeId }) : null;
        }
        entity.animations = await this.resolveDefaultAnimationsForRace(entity);
        return this.raceRepository.save(entity);
    }
    async update(id, data) {
        this.coerceNumbers(data);
        this.normalize(data);
        this.validateEnums(data);
        await this.ensureSoundExists(data.movementSoundId ?? undefined);
        const resolvedArmorTypeId = await this.resolveArmorTypeId(data);
        const animationIdsRaw = data?.animationIds;
        const shouldUpdateAnimations = animationIdsRaw !== undefined;
        delete data.animationIds;
        delete data.armorTypeEntity;
        const existing = await this.raceRepository.findOne({
            where: { id },
            relations: { movementSound: { types: true }, armorTypeEntity: true, animations: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Raza no encontrada');
        Object.assign(existing, data);
        if (data.movementSoundId !== undefined) {
            const nextId = data.movementSoundId === '' ? null : (data.movementSoundId ?? null);
            if (!nextId) {
                existing.movementSoundId = null;
                existing.movementSound = null;
            }
            else {
                const s = await this.soundRepository.findOne({ where: { id: Number(nextId) }, relations: { types: true } });
                if (!s)
                    throw new common_1.BadRequestException('movementSoundId inválido');
                existing.movementSoundId = s.id;
                existing.movementSound = s;
            }
        }
        if (shouldUpdateAnimations) {
            const ids = this.coerceIdArray(animationIdsRaw);
            existing.animations = ids.length ? await this.animationRepository.find({ where: { id: (0, typeorm_2.In)(ids) } }) : [];
        }
        if (resolvedArmorTypeId !== undefined) {
            if (!resolvedArmorTypeId) {
                existing.armorTypeId = null;
                existing.armorTypeEntity = null;
            }
            else {
                const at = await this.armorTypeRepository.findOneBy({ id: resolvedArmorTypeId });
                if (!at)
                    throw new common_1.BadRequestException('armorTypeId inválido');
                existing.armorTypeId = at.id;
                existing.armorTypeEntity = at;
            }
        }
        return this.raceRepository.save(existing);
    }
    async remove(id) {
        await this.raceRepository.delete(id);
    }
};
exports.RaceService = RaceService;
exports.RaceService = RaceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(race_entity_1.Race)),
    __param(1, (0, typeorm_1.InjectRepository)(armorType_entity_1.ArmorType)),
    __param(2, (0, typeorm_1.InjectRepository)(sound_entity_1.Sound)),
    __param(3, (0, typeorm_1.InjectRepository)(animation_entity_1.Animation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RaceService);
//# sourceMappingURL=race.service.js.map