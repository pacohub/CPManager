"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const skill_service_1 = require("../Services/skill.service");
const create_skill_dto_1 = require("../Dto/create-skill.dto");
const update_skill_dto_1 = require("../Dto/update-skill.dto");
let SkillController = class SkillController {
    skillService;
    constructor(skillService) {
        this.skillService = skillService;
    }
    async findAll() {
        return this.skillService.findAll();
    }
    async findOne(id) {
        return this.skillService.findOne(Number(id));
    }
    async create(data) {
        const payload = { ...data };
        if (data.casterVisualId)
            payload.casterVisual = { id: Number(data.casterVisualId) };
        if (data.missileVisualId)
            payload.missileVisual = { id: Number(data.missileVisualId) };
        if (data.targetVisualId)
            payload.targetVisual = { id: Number(data.targetVisualId) };
        delete payload.casterVisualId;
        delete payload.missileVisualId;
        delete payload.targetVisualId;
        return this.skillService.create(payload);
    }
    functionFileName(file) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        return `${base}-${Date.now()}${ext}`;
    }
    async uploadIcon(file) {
        if (!file?.filename)
            return { icon: '' };
        return { icon: `/uploads/images/${file.filename}` };
    }
    async update(id, data) {
        const payload = { ...data };
        if (data.casterVisualId)
            payload.casterVisual = { id: Number(data.casterVisualId) };
        if (data.missileVisualId)
            payload.missileVisual = { id: Number(data.missileVisualId) };
        if (data.targetVisualId)
            payload.targetVisual = { id: Number(data.targetVisualId) };
        delete payload.casterVisualId;
        delete payload.missileVisualId;
        delete payload.targetVisualId;
        return this.skillService.update(Number(id), payload);
    }
    async remove(id) {
        return this.skillService.remove(Number(id));
    }
    async importBlizzard(body = {}) {
        try {
            const res = await this.skillService.importFromBlizzard({ region: body.region, locale: body.locale, limit: body.limit });
            return { ok: true, ...res };
        }
        catch (e) {
            return { ok: false, error: e?.message || String(e) };
        }
    }
};
exports.SkillController = SkillController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_skill_dto_1.CreateSkillDto]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload-icon'),
    (0, common_2.UseInterceptors)((0, platform_express_1.FileInterceptor)('iconImage', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                cb(null, './uploads/images');
            },
            filename: (req, file, cb) => cb(null, `${path.basename(file.originalname, path.extname(file.originalname))}-${Date.now()}${path.extname(file.originalname)}`),
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_2.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "uploadIcon", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_skill_dto_1.UpdateSkillDto]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('import-blizzard'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SkillController.prototype, "importBlizzard", null);
exports.SkillController = SkillController = __decorate([
    (0, common_1.Controller)('skills'),
    __metadata("design:paramtypes", [skill_service_1.SkillService])
], SkillController);
//# sourceMappingURL=skill.controller.js.map