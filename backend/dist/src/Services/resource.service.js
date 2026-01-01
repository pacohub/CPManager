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
exports.ResourceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resource_entity_1 = require("../Entities/resource.entity");
const resourceType_entity_1 = require("../Entities/resourceType.entity");
let ResourceService = class ResourceService {
    resourceRepository;
    resourceTypeRepository;
    constructor(resourceRepository, resourceTypeRepository) {
        this.resourceRepository = resourceRepository;
        this.resourceTypeRepository = resourceTypeRepository;
    }
    async findAll() {
        return this.resourceRepository
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.resourceType', 'resourceType')
            .orderBy('LOWER(r.name)', 'ASC')
            .addOrderBy('r.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.resourceRepository.findOne({ where: { id }, relations: { resourceType: true } });
    }
    normalizeText(value) {
        return String(value ?? '').trim();
    }
    async create(data) {
        const name = this.normalizeText(data?.name);
        if (!name)
            throw new common_1.BadRequestException('name es requerido');
        const description = this.normalizeText(data?.description);
        const icon = this.normalizeText(data?.icon);
        const fileLink = this.normalizeText(data?.fileLink);
        const resourceTypeId = Number(data?.resourceTypeId ?? data?.resourceType?.id);
        if (!Number.isFinite(resourceTypeId))
            throw new common_1.BadRequestException('resourceTypeId es requerido');
        const resourceType = await this.resourceTypeRepository.findOneBy({ id: resourceTypeId });
        if (!resourceType)
            throw new common_1.NotFoundException('Tipo de recurso no encontrado');
        const entity = this.resourceRepository.create({
            name,
            description: description || '',
            icon: icon || '',
            fileLink: fileLink || '',
            resourceType,
        });
        return this.resourceRepository.save(entity);
    }
    async update(id, data) {
        const existing = await this.resourceRepository.findOne({ where: { id }, relations: { resourceType: true } });
        if (!existing)
            throw new common_1.NotFoundException('Recurso no encontrado');
        if (data?.name !== undefined) {
            const name = this.normalizeText(data?.name);
            if (!name)
                throw new common_1.BadRequestException('name es requerido');
            existing.name = name;
        }
        if (data?.description !== undefined)
            existing.description = this.normalizeText(data?.description) || '';
        if (data?.icon !== undefined)
            existing.icon = this.normalizeText(data?.icon) || '';
        if (data?.fileLink !== undefined)
            existing.fileLink = this.normalizeText(data?.fileLink) || '';
        if (data?.resourceTypeId !== undefined || data?.resourceType?.id !== undefined) {
            const resourceTypeId = Number(data?.resourceTypeId ?? data?.resourceType?.id);
            if (!Number.isFinite(resourceTypeId))
                throw new common_1.BadRequestException('resourceTypeId inválido');
            const resourceType = await this.resourceTypeRepository.findOneBy({ id: resourceTypeId });
            if (!resourceType)
                throw new common_1.NotFoundException('Tipo de recurso no encontrado');
            existing.resourceType = resourceType;
        }
        await this.resourceRepository.save(existing);
        return this.findOne(id);
    }
    async remove(id) {
        if (!Number.isFinite(id) || id <= 0)
            throw new common_1.BadRequestException('id inválido');
        try {
            await this.resourceRepository.manager.transaction(async (manager) => {
                const repo = manager.getRepository(resource_entity_1.Resource);
                const existing = await repo.findOne({ where: { id }, relations: { chapters: true } });
                if (!existing)
                    throw new common_1.NotFoundException('Recurso no encontrado');
                const chapterIds = (existing.chapters ?? [])
                    .map((c) => Number(c?.id))
                    .filter((n) => Number.isFinite(n) && n > 0);
                if (chapterIds.length) {
                    await manager
                        .createQueryBuilder()
                        .relation(resource_entity_1.Resource, 'chapters')
                        .of(id)
                        .remove(chapterIds);
                }
                await repo.delete(id);
            });
        }
        catch (err) {
            const message = String(err?.message ?? '');
            if (message.includes('FOREIGN KEY constraint failed') || message.includes('SQLITE_CONSTRAINT')) {
                throw new common_1.ConflictException('No se puede eliminar el recurso porque está en uso');
            }
            throw err;
        }
    }
};
exports.ResourceService = ResourceService;
exports.ResourceService = ResourceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resource_entity_1.Resource)),
    __param(1, (0, typeorm_1.InjectRepository)(resourceType_entity_1.ResourceType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ResourceService);
//# sourceMappingURL=resource.service.js.map