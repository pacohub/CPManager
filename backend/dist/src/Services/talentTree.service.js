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
exports.TalentTreeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const talentTree_entity_1 = require("../Entities/talentTree.entity");
const talentTreeTalent_entity_1 = require("../Entities/talentTreeTalent.entity");
const talentTreeLink_entity_1 = require("../Entities/talentTreeLink.entity");
const talent_entity_1 = require("../Entities/talent.entity");
let TalentTreeService = class TalentTreeService {
    treeRepository;
    entryRepository;
    linkRepository;
    talentRepository;
    constructor(treeRepository, entryRepository, linkRepository, talentRepository) {
        this.treeRepository = treeRepository;
        this.entryRepository = entryRepository;
        this.linkRepository = linkRepository;
        this.talentRepository = talentRepository;
    }
    async findAll() {
        return this.treeRepository.find({ relations: { entries: true, links: true } });
    }
    async findOne(id) {
        return this.treeRepository.findOne({ where: { id }, relations: { entries: { talent: true }, links: true } });
    }
    async create(data) {
        if (!data.name || typeof data.name !== 'string' || !data.name.trim())
            throw new common_1.BadRequestException('name es requerido');
        const t = this.treeRepository.create({ name: data.name.trim(), file: data.file ?? null });
        const saved = (await this.treeRepository.save(t));
        if (Array.isArray(data.entries) && data.entries.length) {
            const entries = data.entries;
            for (const e of entries) {
                const tid = Number(e.talentId);
                if (!Number.isFinite(tid))
                    continue;
                const talent = await this.talentRepository.findOneBy({ id: tid });
                if (!talent)
                    continue;
                const ent = this.entryRepository.create({ talentTree: saved, talent, posX: Number(e.posX) || 0, posY: Number(e.posY) || 0, order: Number(e.order) || 0 });
                await this.entryRepository.save(ent);
            }
        }
        if (Array.isArray(data.links) && data.links.length) {
            const links = data.links;
            for (const l of links) {
                const fromX = Number(l.fromX);
                const fromY = Number(l.fromY);
                const toX = Number(l.toX);
                const toY = Number(l.toY);
                if (!Number.isFinite(fromX) || !Number.isFinite(fromY) || !Number.isFinite(toX) || !Number.isFinite(toY))
                    continue;
                const created = this.linkRepository.create({ talentTree: saved, fromX, fromY, toX, toY });
                await this.linkRepository.save(created);
            }
        }
        return this.findOne(saved.id);
    }
    async update(id, data) {
        const existing = await this.treeRepository.findOne({ where: { id }, relations: { entries: true } });
        if (!existing)
            return null;
        if (data.name !== undefined)
            existing.name = String(data.name ?? '').trim();
        if (data.file !== undefined)
            existing.file = data.file;
        await this.treeRepository.save(existing);
        if (Array.isArray(data.entries)) {
            await this.entryRepository.delete({ talentTreeId: id });
            const entries = data.entries;
            for (const e of entries) {
                const tid = Number(e.talentId);
                if (!Number.isFinite(tid))
                    continue;
                const talent = await this.talentRepository.findOneBy({ id: tid });
                if (!talent)
                    continue;
                const ent = this.entryRepository.create({ talentTree: existing, talent, posX: Number(e.posX) || 0, posY: Number(e.posY) || 0, order: Number(e.order) || 0 });
                await this.entryRepository.save(ent);
            }
        }
        if (Array.isArray(data.links)) {
            await this.linkRepository.delete({ talentTreeId: id });
            const links = data.links;
            for (const l of links) {
                const fromX = Number(l.fromX);
                const fromY = Number(l.fromY);
                const toX = Number(l.toX);
                const toY = Number(l.toY);
                if (!Number.isFinite(fromX) || !Number.isFinite(fromY) || !Number.isFinite(toX) || !Number.isFinite(toY))
                    continue;
                const created = this.linkRepository.create({ talentTree: existing, fromX, fromY, toX, toY });
                await this.linkRepository.save(created);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.treeRepository.delete(id);
    }
};
exports.TalentTreeService = TalentTreeService;
exports.TalentTreeService = TalentTreeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(talentTree_entity_1.TalentTree)),
    __param(1, (0, typeorm_1.InjectRepository)(talentTreeTalent_entity_1.TalentTreeTalent)),
    __param(2, (0, typeorm_1.InjectRepository)(talentTreeLink_entity_1.TalentTreeLink)),
    __param(3, (0, typeorm_1.InjectRepository)(talent_entity_1.Talent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TalentTreeService);
//# sourceMappingURL=talentTree.service.js.map