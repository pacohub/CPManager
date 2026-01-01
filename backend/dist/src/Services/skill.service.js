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
exports.SkillService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const skill_entity_1 = require("../Entities/skill.entity");
let SkillService = class SkillService {
    skillRepository;
    constructor(skillRepository) {
        this.skillRepository = skillRepository;
    }
    async findAll() {
        return this.skillRepository
            .createQueryBuilder('skill')
            .orderBy('LOWER(skill.name)', 'ASC')
            .addOrderBy('skill.id', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return this.skillRepository.findOneBy({ id });
    }
    async create(data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (typeof data.description === 'string')
            data.description = data.description.trim();
        const s = this.skillRepository.create(data);
        return this.skillRepository.save(s);
    }
    async update(id, data) {
        if (typeof data.name === 'string')
            data.name = data.name.trim();
        if (typeof data.description === 'string')
            data.description = data.description.trim();
        await this.skillRepository.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.skillRepository.delete(id);
    }
    async importFromBlizzard(options = {}) {
        const region = (options.region || 'us').toLowerCase();
        const locale = options.locale || (region === 'eu' ? 'es_ES' : 'en_US');
        const limit = options.limit && Number.isFinite(options.limit) ? options.limit : undefined;
        const clientId = process.env.BLIZZARD_CLIENT_ID;
        const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;
        if (!clientId || !clientSecret)
            throw new Error('BLIZZARD_CLIENT_ID/BLIZZARD_CLIENT_SECRET not set in environment');
        const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const tokenRes = await fetch('https://oauth.battle.net/token', {
            method: 'POST',
            headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=client_credentials',
        });
        if (!tokenRes.ok)
            throw new Error(`Token fetch failed: ${tokenRes.status}`);
        const tokenJson = await tokenRes.json();
        const token = tokenJson.access_token;
        const base = `https://${region}.api.blizzard.com`;
        const namespace = `static-${region}`;
        const idxUrl = `${base}/data/wow/spell/index?namespace=${namespace}&locale=${locale}&access_token=${token}`;
        const idxRes = await fetch(idxUrl);
        if (!idxRes.ok)
            throw new Error(`Index fetch failed: ${idxRes.status}`);
        const idxJson = await idxRes.json();
        const entries = idxJson.spells ?? idxJson.results ?? [];
        let inserted = 0;
        let skipped = 0;
        let processed = 0;
        for (const e of entries) {
            if (limit && processed >= limit)
                break;
            processed++;
            const id = e.id;
            try {
                const exists = await this.skillRepository.findOneBy({ id });
                if (exists) {
                    skipped++;
                    continue;
                }
                const detailUrl = `${base}/data/wow/spell/${id}?namespace=${namespace}&locale=${locale}&access_token=${token}`;
                const detRes = await fetch(detailUrl);
                if (!detRes.ok) {
                    skipped++;
                    continue;
                }
                const det = await detRes.json();
                const name = det.name && typeof det.name === 'string' ? det.name : (det?.name?.[locale] ?? det?.name?.en_US ?? det?.name ?? null);
                let description = null;
                if (det.description)
                    description = String(det.description);
                else if (det.effects && Array.isArray(det.effects))
                    description = det.effects.map((x) => x.description || '').filter(Boolean).join('\n');
                else
                    description = null;
                const extras = [];
                if (det.cast_time)
                    extras.push(`Cast time: ${JSON.stringify(det.cast_time)}`);
                if (det.range)
                    extras.push(`Range: ${JSON.stringify(det.range)}`);
                if (det.cooldown)
                    extras.push(`Cooldown: ${JSON.stringify(det.cooldown)}`);
                if (det.power_cost)
                    extras.push(`Power cost: ${JSON.stringify(det.power_cost)}`);
                if (extras.length) {
                    const extraText = extras.join('\n');
                    description = (description ? description + '\n\n' : '') + extraText;
                }
                const ent = this.skillRepository.create({ id, name: String(name).substring(0, 140), description: description ?? null });
                await this.skillRepository.insert(ent);
                inserted++;
            }
            catch (err) {
                skipped++;
            }
        }
        return { inserted, skipped };
    }
};
exports.SkillService = SkillService;
exports.SkillService = SkillService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(skill_entity_1.Skill)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SkillService);
//# sourceMappingURL=skill.service.js.map