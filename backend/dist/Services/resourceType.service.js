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
exports.ResourceTypeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resourceType_entity_1 = require("../Entities/resourceType.entity");
let ResourceTypeService = class ResourceTypeService {
    resourceTypeRepository;
    constructor(resourceTypeRepository) {
        this.resourceTypeRepository = resourceTypeRepository;
    }
    async findAll() {
        return this.resourceTypeRepository
            .createQueryBuilder('rt')
            .orderBy('LOWER(rt.name)', 'ASC')
            .addOrderBy('rt.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.resourceTypeRepository.findOneBy({ id });
    }
    normalize(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
    }
    async create(data) {
        this.normalize(data);
        if (!String(data?.name ?? '').trim())
            throw new common_1.BadRequestException('name es requerido');
        const entity = this.resourceTypeRepository.create(data);
        return this.resourceTypeRepository.save(entity);
    }
    async update(id, data) {
        this.normalize(data);
        await this.resourceTypeRepository.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.resourceTypeRepository.delete(id);
    }
};
exports.ResourceTypeService = ResourceTypeService;
exports.ResourceTypeService = ResourceTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resourceType_entity_1.ResourceType)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ResourceTypeService);
//# sourceMappingURL=resourceType.service.js.map