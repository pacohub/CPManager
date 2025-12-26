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
exports.ChapterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chapter_entity_1 = require("../Entities/chapter.entity");
let ChapterService = class ChapterService {
    chapterRepository;
    constructor(chapterRepository) {
        this.chapterRepository = chapterRepository;
    }
    async findAllByCampaign(campaignId) {
        return this.chapterRepository.find({ where: { campaignId }, order: { id: 'ASC' } });
    }
    async findOne(id) {
        return this.chapterRepository.findOneBy({ id });
    }
    async create(data) {
        const chapter = this.chapterRepository.create(data);
        return this.chapterRepository.save(chapter);
    }
    async update(id, data) {
        await this.chapterRepository.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.chapterRepository.delete(id);
    }
};
exports.ChapterService = ChapterService;
exports.ChapterService = ChapterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chapter_entity_1.Chapter)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ChapterService);
//# sourceMappingURL=chapter.service.js.map