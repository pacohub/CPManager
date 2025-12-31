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
exports.SoundService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sound_entity_1 = require("../Entities/sound.entity");
const soundType_entity_1 = require("../Entities/soundType.entity");
let SoundService = class SoundService {
    soundRepository;
    soundTypeRepository;
    constructor(soundRepository, soundTypeRepository) {
        this.soundRepository = soundRepository;
        this.soundTypeRepository = soundTypeRepository;
    }
    async findAll() {
        return this.soundRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.types', 't')
            .orderBy('LOWER(s.name)', 'ASC')
            .addOrderBy('s.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.soundRepository.findOne({ where: { id }, relations: { types: true } });
    }
    normalize(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (typeof data.file === 'string')
            data.file = data.file.trim();
    }
    async resolveTypes(typeIds) {
        if (typeIds === undefined || typeIds === null)
            return [];
        if (!Array.isArray(typeIds))
            throw new common_1.BadRequestException('typeIds debe ser un array de ids');
        const ids = typeIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
        if (ids.length === 0)
            return [];
        return this.soundTypeRepository.find({ where: { id: (0, typeorm_2.In)(ids) } });
    }
    async create(data) {
        this.normalize(data);
        if (!data.name)
            throw new common_1.BadRequestException('name es requerido');
        const types = await this.resolveTypes(data.typeIds);
        if (!types.length)
            throw new common_1.BadRequestException('Debe seleccionar al menos un tipo');
        const entity = this.soundRepository.create({ ...data, types });
        return this.soundRepository.save(entity);
    }
    async update(id, data) {
        this.normalize(data);
        const existing = await this.findOne(id);
        if (!existing)
            throw new common_1.NotFoundException('Sound no encontrado');
        let types = existing.types;
        if (data.typeIds !== undefined) {
            types = await this.resolveTypes(data.typeIds);
        }
        if (!types.length)
            throw new common_1.BadRequestException('Debe seleccionar al menos un tipo');
        await this.soundRepository.save({ ...existing, ...data, types });
        return this.findOne(id);
    }
    async remove(id) {
        await this.soundRepository.delete(id);
    }
};
exports.SoundService = SoundService;
exports.SoundService = SoundService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sound_entity_1.Sound)),
    __param(1, (0, typeorm_1.InjectRepository)(soundType_entity_1.SoundType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SoundService);
//# sourceMappingURL=sound.service.js.map