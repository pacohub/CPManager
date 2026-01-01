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
exports.EffectService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const effect_entity_1 = require("../Entities/effect.entity");
let EffectService = class EffectService {
    effectRepository;
    constructor(effectRepository) {
        this.effectRepository = effectRepository;
    }
    async findAll() {
        return this.effectRepository
            .createQueryBuilder('effect')
            .orderBy('LOWER(effect.name)', 'ASC')
            .addOrderBy('effect.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.effectRepository.findOneBy({ id });
    }
    async create(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (typeof data.description === 'string')
            data.description = data.description.trim();
        const e = this.effectRepository.create(data);
        return this.effectRepository.save(e);
    }
    async update(id, data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (typeof data.description === 'string')
            data.description = data.description.trim();
        await this.effectRepository.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.effectRepository.delete(id);
    }
};
exports.EffectService = EffectService;
exports.EffectService = EffectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(effect_entity_1.Effect)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EffectService);
//# sourceMappingURL=effect.service.js.map