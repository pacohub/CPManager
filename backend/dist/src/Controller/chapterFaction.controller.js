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
exports.ChapterFactionController = void 0;
const common_1 = require("@nestjs/common");
const chapterFaction_service_1 = require("../Services/chapterFaction.service");
let ChapterFactionController = class ChapterFactionController {
    chapterFactionService;
    constructor(chapterFactionService) {
        this.chapterFactionService = chapterFactionService;
    }
    async byCampaign(campaignId) {
        const id = Number(campaignId);
        if (!Number.isFinite(id))
            return {};
        const list = await this.chapterFactionService.findByCampaign(id);
        const map = {};
        for (const item of list) {
            if (!map[item.chapterId])
                map[item.chapterId] = [];
            map[item.chapterId].push(item);
        }
        return map;
    }
    async getForChapter(chapterId) {
        return this.chapterFactionService.findByChapter(Number(chapterId));
    }
    async replaceForChapter(chapterId, body) {
        return this.chapterFactionService.replaceForChapter(Number(chapterId), body?.links ?? []);
    }
    async setColorOverride(chapterId, factionId, body) {
        return this.chapterFactionService.setColorOverride(Number(chapterId), Number(factionId), body?.colorOverride ?? null);
    }
};
exports.ChapterFactionController = ChapterFactionController;
__decorate([
    (0, common_1.Get)('by-campaign'),
    __param(0, (0, common_1.Query)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChapterFactionController.prototype, "byCampaign", null);
__decorate([
    (0, common_1.Get)(':chapterId'),
    __param(0, (0, common_1.Param)('chapterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChapterFactionController.prototype, "getForChapter", null);
__decorate([
    (0, common_1.Put)(':chapterId'),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChapterFactionController.prototype, "replaceForChapter", null);
__decorate([
    (0, common_1.Put)(':chapterId/:factionId/color'),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Param)('factionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ChapterFactionController.prototype, "setColorOverride", null);
exports.ChapterFactionController = ChapterFactionController = __decorate([
    (0, common_1.Controller)('chapter-factions'),
    __metadata("design:paramtypes", [chapterFaction_service_1.ChapterFactionService])
], ChapterFactionController);
//# sourceMappingURL=chapterFaction.controller.js.map