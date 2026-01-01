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
exports.ArmorTypeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const armorType_entity_1 = require("../Entities/armorType.entity");
const race_entity_1 = require("../Entities/race.entity");
const sound_entity_1 = require("../Entities/sound.entity");
const DEFAULT_ARMOR_TYPES = ['carne', 'etérea', 'metal', 'piedra', 'madera'];
let ArmorTypeService = class ArmorTypeService {
    armorTypeRepository;
    raceRepository;
    soundRepository;
    constructor(armorTypeRepository, raceRepository, soundRepository) {
        this.armorTypeRepository = armorTypeRepository;
        this.raceRepository = raceRepository;
        this.soundRepository = soundRepository;
    }
    normalize(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
    }
    async ensureSeeded() {
        const count = await this.armorTypeRepository.count();
        if (count > 0)
            return;
        await this.armorTypeRepository.save(DEFAULT_ARMOR_TYPES.map((name) => this.armorTypeRepository.create({ name, sounds: [] })));
    }
    async resolveSounds(soundIds) {
        if (soundIds === undefined || soundIds === null)
            return [];
        if (!Array.isArray(soundIds))
            throw new common_1.BadRequestException('soundIds debe ser un array de ids');
        const ids = soundIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
        if (ids.length === 0)
            return [];
        return this.soundRepository.find({ where: { id: (0, typeorm_2.In)(ids) }, relations: { types: true } });
    }
    async findAll() {
        await this.ensureSeeded();
        return this.armorTypeRepository
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.sounds', 's')
            .leftJoinAndSelect('s.types', 'st')
            .orderBy('LOWER(a.name)', 'ASC')
            .addOrderBy('a.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.armorTypeRepository.findOne({ where: { id }, relations: { sounds: { types: true } } });
    }
    async create(data) {
        this.normalize(data);
        if (!data.name)
            throw new common_1.BadRequestException('name es requerido');
        const sounds = await this.resolveSounds(data.soundIds);
        const entity = this.armorTypeRepository.create({ name: data.name, sounds });
        return this.armorTypeRepository.save(entity);
    }
    async update(id, data) {
        this.normalize(data);
        const existing = await this.findOne(id);
        if (!existing)
            throw new common_1.NotFoundException('Tipo de armadura no encontrado');
        let sounds = existing.sounds;
        if (data.soundIds !== undefined) {
            sounds = await this.resolveSounds(data.soundIds);
        }
        await this.armorTypeRepository.save({ ...existing, ...data, sounds });
        return this.findOne(id);
    }
    async resetToDefaults() {
        await this.armorTypeRepository.manager.transaction(async (manager) => {
            await manager.getRepository(race_entity_1.Race).createQueryBuilder().update().set({ armorTypeId: null, armorType: null }).execute();
            await manager.query('DELETE FROM armor_type_sounds');
            await manager.getRepository(armorType_entity_1.ArmorType).createQueryBuilder().delete().execute();
            await manager.getRepository(armorType_entity_1.ArmorType).save(DEFAULT_ARMOR_TYPES.map((name) => manager.getRepository(armorType_entity_1.ArmorType).create({ name, sounds: [] })));
        });
        return this.findAll();
    }
    async remove(id) {
        await this.armorTypeRepository.delete(id);
    }
};
exports.ArmorTypeService = ArmorTypeService;
exports.ArmorTypeService = ArmorTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(armorType_entity_1.ArmorType)),
    __param(1, (0, typeorm_1.InjectRepository)(race_entity_1.Race)),
    __param(2, (0, typeorm_1.InjectRepository)(sound_entity_1.Sound)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ArmorTypeService);
//# sourceMappingURL=armorType.service.js.map