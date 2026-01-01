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
exports.ProfessionObjectResourceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const professionObjectResource_entity_1 = require("../Entities/professionObjectResource.entity");
const profession_entity_1 = require("../Entities/profession.entity");
function toInt(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n))
        return fallback;
    return Math.trunc(n);
}
let ProfessionObjectResourceService = class ProfessionObjectResourceService {
    professionObjectResourceRepository;
    professionRepository;
    constructor(professionObjectResourceRepository, professionRepository) {
        this.professionObjectResourceRepository = professionObjectResourceRepository;
        this.professionRepository = professionRepository;
    }
    async findForObject(professionId, objectId) {
        return this.professionObjectResourceRepository
            .createQueryBuilder('por')
            .where('por.professionId = :professionId', { professionId })
            .andWhere('por.objectId = :objectId', { objectId })
            .orderBy('por.resourceId', 'ASC')
            .addOrderBy('por.id', 'ASC')
            .getMany();
    }
    async findByProfession(professionId) {
        return this.professionObjectResourceRepository
            .createQueryBuilder('por')
            .where('por.professionId = :professionId', { professionId })
            .orderBy('por.objectId', 'ASC')
            .addOrderBy('por.resourceId', 'ASC')
            .addOrderBy('por.id', 'ASC')
            .getMany();
    }
    async replaceForObject(professionId, objectId, links) {
        const cleaned = (links ?? [])
            .filter((l) => l && Number.isFinite(Number(l.resourceId)))
            .map((l) => ({
            resourceId: Number(l.resourceId),
            quantity: Math.max(0, toInt(l.quantity, 1)),
        }));
        if (cleaned.length > 200) {
            throw new common_1.BadRequestException('Máximo 200 recursos por objeto asociado');
        }
        const profession = await this.professionRepository.findOneBy({ id: professionId });
        if (!profession)
            throw new common_1.NotFoundException('Profesión no encontrada');
        const byResourceId = new Map();
        for (const l of cleaned)
            byResourceId.set(l.resourceId, l);
        const deduped = Array.from(byResourceId.values());
        await this.professionObjectResourceRepository.delete({ professionId, objectId });
        if (deduped.length === 0)
            return [];
        await this.professionObjectResourceRepository.save(deduped.map((l) => ({
            professionId,
            objectId,
            resourceId: l.resourceId,
            quantity: l.quantity,
        })));
        return this.findForObject(professionId, objectId);
    }
};
exports.ProfessionObjectResourceService = ProfessionObjectResourceService;
exports.ProfessionObjectResourceService = ProfessionObjectResourceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(professionObjectResource_entity_1.ProfessionObjectResource)),
    __param(1, (0, typeorm_1.InjectRepository)(profession_entity_1.Profession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProfessionObjectResourceService);
//# sourceMappingURL=professionObjectResource.service.js.map