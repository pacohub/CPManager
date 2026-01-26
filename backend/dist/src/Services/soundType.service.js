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
exports.SoundTypeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const soundType_entity_1 = require("../Entities/soundType.entity");
const sound_entity_1 = require("../Entities/sound.entity");
let SoundTypeService = class SoundTypeService {
    soundTypeRepository;
    soundRepository;
    constructor(soundTypeRepository, soundRepository) {
        this.soundTypeRepository = soundTypeRepository;
        this.soundRepository = soundRepository;
    }
    async findAll() {
        return this.soundTypeRepository
            .createQueryBuilder('t')
            .orderBy('LOWER(t.name)', 'ASC')
            .addOrderBy('t.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.soundTypeRepository.findOneBy({ id });
    }
    normalize(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
    }
    async create(data) {
        this.normalize(data);
        if (!data.name)
            throw new common_1.BadRequestException('name es requerido');
        const entity = this.soundTypeRepository.create(data);
        return this.soundTypeRepository.save(entity);
    }
    async update(id, data) {
        this.normalize(data);
        await this.soundTypeRepository.update(id, data);
        return this.findOne(id);
    }
    async getUsage(id) {
        const sounds = await this.soundRepository
            .createQueryBuilder('s')
            .innerJoin('s.types', 't', 't.id = :id', { id })
            .select(['s.id'])
            .getMany();
        const ids = (sounds || []).map((s) => s.id);
        return { count: ids.length, soundIds: ids };
    }
    async remove(id) {
        const usage = await this.getUsage(id);
        const removedIds = usage.soundIds || [];
        try {
            await this.soundTypeRepository.manager.transaction(async (manager) => {
                const info = await manager.query("PRAGMA table_info('sound_types')");
                const colNames = (info || []).map((c) => String(c.name));
                let typeCol = colNames.find((n) => /sound.*type/i.test(n) || /type.*sound/i.test(n));
                if (!typeCol)
                    typeCol = colNames.find((n) => /type/i.test(n));
                if (!typeCol)
                    typeCol = 'soundTypeId';
                console.log('[soundType.remove] sound_types columns=', colNames);
                const sql = `DELETE FROM sound_types WHERE "${typeCol}" = ?`;
                console.log('[soundType.remove] executing:', sql, 'with id=', id);
                const res = await manager.query(sql, [id]);
                console.log('[soundType.remove] delete join result=', res);
                console.log('[soundType.remove] deleting sound_type id=', id);
                await manager.delete(soundType_entity_1.SoundType, id);
            });
        }
        catch (err) {
            console.error('[soundType.remove] error during removal', err);
            throw err;
        }
        return { removedCount: removedIds.length, removedSoundIds: removedIds };
    }
};
exports.SoundTypeService = SoundTypeService;
exports.SoundTypeService = SoundTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(soundType_entity_1.SoundType)),
    __param(1, (0, typeorm_1.InjectRepository)(sound_entity_1.Sound)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SoundTypeService);
//# sourceMappingURL=soundType.service.js.map