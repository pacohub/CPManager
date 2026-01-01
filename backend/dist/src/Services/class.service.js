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
const animation_entity_1 = require("../Entities/animation.entity");
const class_entity_1 = require("../Entities/class.entity");
let ClassService = class ClassService {
    classRepository;
    animationRepository;
    constructor(classRepository, animationRepository) {
        this.classRepository = classRepository;
        this.animationRepository = animationRepository;
    }
    coerceIdArray(value) {
        if (!Array.isArray(value))
            return [];
        const out = [];
        const seen = new Set();
        for (const raw of value) {
            const n = Number.parseInt(String(raw), 10);
            if (!Number.isFinite(n) || n <= 0)
                continue;
            if (seen.has(n))
                continue;
            seen.add(n);
            out.push(n);
        }
        return out;
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
            .leftJoinAndSelect('c.animations', 'a')
            .orderBy('LOWER(c.name)', 'ASC')
            .addOrderBy('c.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.classRepository.findOne({ where: { id }, relations: { animations: true } });
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
        const existing = await this.classRepository.findOne({ where: { id }, relations: { animations: true } });
        if (!existing)
            return null;
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
        Object.assign(existing, patch);
        if (data?.animationIds !== undefined) {
            const ids = this.coerceIdArray(data.animationIds);
            existing.animations = ids.length ? await this.animationRepository.find({ where: { id: (0, typeorm_2.In)(ids) } }) : [];
        }
        await this.classRepository.save(existing);
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
    __param(1, (0, typeorm_1.InjectRepository)(animation_entity_1.Animation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ClassService);
//# sourceMappingURL=class.service.js.map