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
exports.SkillEffectController = void 0;
const common_1 = require("@nestjs/common");
const skillEffect_service_1 = require("../Services/skillEffect.service");
const create_skillEffect_dto_1 = require("../Dto/create-skillEffect.dto");
const update_skillEffect_dto_1 = require("../Dto/update-skillEffect.dto");
let SkillEffectController = class SkillEffectController {
    skillEffectService;
    constructor(skillEffectService) {
        this.skillEffectService = skillEffectService;
    }
    async findAll() {
        return this.skillEffectService.findAll();
    }
    async findOne(id) {
        return this.skillEffectService.findOne(Number(id));
    }
    async create(data) {
        const payload = { ...data };
        if (data.skillId)
            payload.skill = { id: Number(data.skillId) };
        if (data.effectId)
            payload.effect = { id: Number(data.effectId) };
        delete payload.skillId;
        delete payload.effectId;
        return this.skillEffectService.create(payload);
    }
    async update(id, data) {
        const payload = { ...data };
        if (data.skillId)
            payload.skill = { id: Number(data.skillId) };
        if (data.effectId)
            payload.effect = { id: Number(data.effectId) };
        delete payload.skillId;
        delete payload.effectId;
        return this.skillEffectService.update(Number(id), payload);
    }
    async remove(id) {
        return this.skillEffectService.remove(Number(id));
    }
};
exports.SkillEffectController = SkillEffectController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SkillEffectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SkillEffectController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_skillEffect_dto_1.CreateSkillEffectDto]),
    __metadata("design:returntype", Promise)
], SkillEffectController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_skillEffect_dto_1.UpdateSkillEffectDto]),
    __metadata("design:returntype", Promise)
], SkillEffectController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SkillEffectController.prototype, "remove", null);
exports.SkillEffectController = SkillEffectController = __decorate([
    (0, common_1.Controller)('skill-effects'),
    __metadata("design:paramtypes", [skillEffect_service_1.SkillEffectService])
], SkillEffectController);
//# sourceMappingURL=skillEffect.controller.js.map