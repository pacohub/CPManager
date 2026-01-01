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
exports.DefenseTypeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const defenseType_entity_1 = require("../Entities/defenseType.entity");
let DefenseTypeService = class DefenseTypeService {
    defenseTypeRepository;
    constructor(defenseTypeRepository) {
        this.defenseTypeRepository = defenseTypeRepository;
    }
    normalize(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
    }
    async findAll() {
        return this.defenseTypeRepository
            .createQueryBuilder('dt')
            .orderBy('LOWER(dt.name)', 'ASC')
            .addOrderBy('dt.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.defenseTypeRepository.findOneBy({ id });
    }
    async create(data) {
        this.normalize(data);
        if (!String(data?.name ?? '').trim())
            throw new common_1.BadRequestException('name es requerido');
        const entity = this.defenseTypeRepository.create({ name: String(data.name).trim() });
        return this.defenseTypeRepository.save(entity);
    }
    async update(id, data) {
        this.normalize(data);
        const existing = await this.findOne(id);
        if (!existing)
            throw new common_1.NotFoundException('Tipo de defensa no encontrado');
        if (data?.name !== undefined) {
            if (!String(data.name ?? '').trim())
                throw new common_1.BadRequestException('name es requerido');
            existing.name = String(data.name).trim();
        }
        await this.defenseTypeRepository.save(existing);
        return this.findOne(id);
    }
    async remove(id) {
        await this.defenseTypeRepository.delete(id);
    }
};
exports.DefenseTypeService = DefenseTypeService;
exports.DefenseTypeService = DefenseTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(defenseType_entity_1.DefenseType)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DefenseTypeService);
//# sourceMappingURL=defenseType.service.js.map