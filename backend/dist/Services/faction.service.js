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
exports.FactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const faction_entity_1 = require("../Entities/faction.entity");
const profession_entity_1 = require("../Entities/profession.entity");
let FactionService = class FactionService {
    factionRepository;
    professionRepository;
    constructor(factionRepository, professionRepository) {
        this.factionRepository = factionRepository;
        this.professionRepository = professionRepository;
    }
    async findAll() {
        return this.factionRepository
            .createQueryBuilder('faction')
            .orderBy('LOWER(faction.name)', 'ASC')
            .addOrderBy('faction.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.factionRepository.findOneBy({ id });
    }
    async getProfessions(id) {
        const faction = await this.factionRepository.findOne({
            where: { id },
            relations: { professions: true },
        });
        if (!faction)
            throw new common_1.NotFoundException('Faction no encontrada');
        return faction.professions ?? [];
    }
    async setProfessionIds(id, professionIds) {
        const faction = await this.factionRepository.findOne({
            where: { id },
            relations: { professions: true },
        });
        if (!faction)
            throw new common_1.NotFoundException('Faction no encontrada');
        const uniqueIds = Array.from(new Set((professionIds ?? []).map((x) => Number(x)).filter((x) => Number.isFinite(x))));
        const professions = uniqueIds.length
            ? await this.professionRepository.findBy({ id: (0, typeorm_2.In)(uniqueIds) })
            : [];
        faction.professions = professions;
        return this.factionRepository.save(faction);
    }
    async create(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (typeof data.description === 'string')
            data.description = data.description.trim();
        if (typeof data.file === 'string')
            data.file = data.file.trim();
        const faction = this.factionRepository.create(data);
        return this.factionRepository.save(faction);
    }
    async update(id, data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (typeof data.description === 'string')
            data.description = data.description.trim();
        if (typeof data.file === 'string')
            data.file = data.file.trim();
        await this.factionRepository.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.factionRepository.delete(id);
    }
};
exports.FactionService = FactionService;
exports.FactionService = FactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(faction_entity_1.Faction)),
    __param(1, (0, typeorm_1.InjectRepository)(profession_entity_1.Profession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FactionService);
//# sourceMappingURL=faction.service.js.map