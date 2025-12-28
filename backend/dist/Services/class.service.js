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
exports.ClassService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("../Entities/class.entity");
let ClassService = class ClassService {
    classRepository;
    constructor(classRepository) {
        this.classRepository = classRepository;
    }
    normalizeText(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return '';
        return String(value).trim();
    }
    normalizeLevel(value) {
        const n = Number.parseInt(String(value), 10);
        if (!Number.isFinite(n))
            return 1;
        return Math.max(1, n);
    }
    async findAll() {
        return this.classRepository
            .createQueryBuilder('c')
            .orderBy('LOWER(c.name)', 'ASC')
            .addOrderBy('c.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.classRepository.findOneBy({ id });
    }
    async create(data) {
        const name = this.normalizeText(data?.name);
        if (!name)
            throw new common_1.BadRequestException('name es requerido');
        const item = this.classRepository.create({
            name,
            icon: this.normalizeText(data?.icon) ?? '',
            description: this.normalizeText(data?.description) ?? '',
            level: this.normalizeLevel(data?.level),
        });
        return this.classRepository.save(item);
    }
    async update(id, data) {
        const patch = {};
        if (data?.name !== undefined)
            patch.name = this.normalizeText(data?.name) ?? '';
        if (data?.icon !== undefined)
            patch.icon = this.normalizeText(data?.icon) ?? '';
        if (data?.description !== undefined)
            patch.description = this.normalizeText(data?.description) ?? '';
        if (data?.level !== undefined)
            patch.level = this.normalizeLevel(data?.level);
        if (patch.name !== undefined && !String(patch.name).trim()) {
            throw new common_1.BadRequestException('name es requerido');
        }
        await this.classRepository.update(id, patch);
        return this.findOne(id);
    }
    async remove(id) {
        await this.classRepository.delete(id);
    }
};
exports.ClassService = ClassService;
exports.ClassService = ClassService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClassService);
//# sourceMappingURL=class.service.js.map