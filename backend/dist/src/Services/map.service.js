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
exports.MapService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const component_entity_1 = require("../Entities/component.entity");
const map_entity_1 = require("../Entities/map.entity");
let MapService = class MapService {
    mapRepository;
    componentRepository;
    constructor(mapRepository, componentRepository) {
        this.mapRepository = mapRepository;
        this.componentRepository = componentRepository;
    }
    async findAll() {
        return this.mapRepository
            .createQueryBuilder('map')
            .orderBy('LOWER(map.name)', 'ASC')
            .addOrderBy('map.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.mapRepository.findOneBy({ id });
    }
    async create(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (typeof data.description === 'string')
            data.description = data.description.trim();
        const map = this.mapRepository.create(data);
        return this.mapRepository.save(map);
    }
    async update(id, data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (typeof data.description === 'string')
            data.description = data.description.trim();
        await this.mapRepository.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.mapRepository.delete(id);
    }
    async getComponents(mapId) {
        const map = await this.mapRepository.findOne({ where: { id: mapId }, relations: { components: true } });
        return map?.components ?? [];
    }
    async setComponentIds(mapId, componentIds) {
        const map = await this.mapRepository.findOne({ where: { id: mapId }, relations: { components: true } });
        if (!map)
            throw new Error('Mapa no encontrado');
        const ids = (componentIds || []).map(Number).filter((n) => Number.isFinite(n));
        const components = ids.length ? await this.componentRepository.findBy({ id: (0, typeorm_2.In)(ids) }) : [];
        map.components = components;
        return this.mapRepository.save(map);
    }
};
exports.MapService = MapService;
exports.MapService = MapService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(map_entity_1.Map)),
    __param(1, (0, typeorm_1.InjectRepository)(component_entity_1.Component)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MapService);
//# sourceMappingURL=map.service.js.map