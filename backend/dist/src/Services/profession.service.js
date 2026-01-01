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
exports.ProfessionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profession_entity_1 = require("../Entities/profession.entity");
let ProfessionService = class ProfessionService {
    professionRepository;
    constructor(professionRepository) {
        this.professionRepository = professionRepository;
    }
    normalizeText(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return '';
        return String(value).trim();
    }
    async findAll() {
        return this.professionRepository
            .createQueryBuilder('profession')
            .orderBy('LOWER(profession.name)', 'ASC')
            .addOrderBy('profession.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.professionRepository.findOneBy({ id });
    }
    async create(data) {
        const name = this.normalizeText(data?.name);
        if (!name)
            throw new common_1.BadRequestException('name es requerido');
        const profession = this.professionRepository.create({
            name,
            description: this.normalizeText(data?.description) ?? '',
            link: this.normalizeText(data?.link) ?? '',
        });
        return this.professionRepository.save(profession);
    }
    async update(id, data) {
        const patch = {};
        if (data?.name !== undefined) {
            const name = this.normalizeText(data?.name);
            if (!name)
                throw new common_1.BadRequestException('name es requerido');
            patch.name = name;
        }
        if (data?.description !== undefined)
            patch.description = this.normalizeText(data?.description) ?? '';
        if (data?.link !== undefined)
            patch.link = this.normalizeText(data?.link) ?? '';
        await this.professionRepository.update(id, patch);
        return this.findOne(id);
    }
    async remove(id) {
        await this.professionRepository.delete(id);
    }
};
exports.ProfessionService = ProfessionService;
exports.ProfessionService = ProfessionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profession_entity_1.Profession)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProfessionService);
//# sourceMappingURL=profession.service.js.map