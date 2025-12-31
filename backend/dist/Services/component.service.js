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
exports.ComponentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const component_entity_1 = require("../Entities/component.entity");
let ComponentService = class ComponentService {
    componentRepository;
    constructor(componentRepository) {
        this.componentRepository = componentRepository;
    }
    async findAll() {
        return this.componentRepository
            .createQueryBuilder('c')
            .orderBy('LOWER(c.name)', 'ASC')
            .addOrderBy('c.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.componentRepository.findOneBy({ id });
    }
    normalize(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (typeof data.description === 'string')
            data.description = data.description.trim();
        if (typeof data.model === 'string')
            data.model = data.model.trim();
        if (typeof data.type === 'string')
            data.type = data.type.trim();
    }
    validateType(type) {
        if (type === undefined || type === null)
            return;
        if (typeof type !== 'string')
            throw new common_1.BadRequestException('type debe ser string');
        if (!component_entity_1.COMPONENT_TYPES.includes(type)) {
            throw new common_1.BadRequestException(`type inválido. Debe ser uno de: ${component_entity_1.COMPONENT_TYPES.join(', ')}`);
        }
    }
    async create(data) {
        this.normalize(data);
        this.validateType(data.type);
        const entity = this.componentRepository.create(data);
        return this.componentRepository.save(entity);
    }
    async update(id, data) {
        this.normalize(data);
        this.validateType(data.type);
        await this.componentRepository.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.componentRepository.delete(id);
    }
};
exports.ComponentService = ComponentService;
exports.ComponentService = ComponentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(component_entity_1.Component)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ComponentService);
//# sourceMappingURL=component.service.js.map