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
exports.VisualEffectService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const visualEffect_entity_1 = require("../Entities/visualEffect.entity");
let VisualEffectService = class VisualEffectService {
    visualEffectRepository;
    constructor(visualEffectRepository) {
        this.visualEffectRepository = visualEffectRepository;
    }
    async findAll() {
        return this.visualEffectRepository
            .createQueryBuilder('visualEffect')
            .orderBy('LOWER(visualEffect.name)', 'ASC')
            .addOrderBy('visualEffect.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.visualEffectRepository.findOneBy({ id });
    }
    async create(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        const v = this.visualEffectRepository.create(data);
        return this.visualEffectRepository.save(v);
    }
    async update(id, data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        await this.visualEffectRepository.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.visualEffectRepository.delete(id);
    }
};
exports.VisualEffectService = VisualEffectService;
exports.VisualEffectService = VisualEffectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(visualEffect_entity_1.VisualEffect)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VisualEffectService);
//# sourceMappingURL=visualEffect.service.js.map