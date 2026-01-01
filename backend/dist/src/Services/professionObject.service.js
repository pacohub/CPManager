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
exports.ProfessionObjectService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const professionObject_entity_1 = require("../Entities/professionObject.entity");
const profession_entity_1 = require("../Entities/profession.entity");
function toInt(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n))
        return fallback;
    return Math.trunc(n);
}
let ProfessionObjectService = class ProfessionObjectService {
    professionObjectRepository;
    professionRepository;
    constructor(professionObjectRepository, professionRepository) {
        this.professionObjectRepository = professionObjectRepository;
        this.professionRepository = professionRepository;
    }
    async findByProfession(professionId) {
        return this.professionObjectRepository
            .createQueryBuilder('po')
            .where('po.professionId = :professionId', { professionId })
            .orderBy('po.objectId', 'ASC')
            .addOrderBy('po.id', 'ASC')
            .getMany();
    }
    async replaceForProfession(professionId, links) {
        const cleaned = (links ?? [])
            .filter((l) => l && Number.isFinite(Number(l.objectId)))
            .map((l) => {
            const level = Math.max(1, toInt(l.level, 1));
            const quantity = Math.max(0, toInt(l.quantity, 1));
            const timeSeconds = Math.max(0, toInt(l.timeSeconds, 0));
            return {
                objectId: Number(l.objectId),
                level,
                quantity,
                timeSeconds,
            };
        });
        if (cleaned.length > 200) {
            throw new common_1.BadRequestException('Máximo 200 objetos por profesión');
        }
        const profession = await this.professionRepository.findOneBy({ id: professionId });
        if (!profession)
            throw new common_1.NotFoundException('Profesión no encontrada');
        const byObjectId = new Map();
        for (const l of cleaned)
            byObjectId.set(l.objectId, l);
        const deduped = Array.from(byObjectId.values());
        await this.professionObjectRepository.delete({ professionId });
        if (deduped.length === 0)
            return [];
        await this.professionObjectRepository.save(deduped.map((l) => ({
            professionId,
            objectId: l.objectId,
            level: l.level,
            quantity: l.quantity,
            timeSeconds: l.timeSeconds,
        })));
        return this.findByProfession(professionId);
    }
};
exports.ProfessionObjectService = ProfessionObjectService;
exports.ProfessionObjectService = ProfessionObjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(professionObject_entity_1.ProfessionObject)),
    __param(1, (0, typeorm_1.InjectRepository)(profession_entity_1.Profession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProfessionObjectService);
//# sourceMappingURL=professionObject.service.js.map