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
exports.EffectController = void 0;
const common_1 = require("@nestjs/common");
const effect_service_1 = require("../Services/effect.service");
const create_effect_dto_1 = require("../Dto/create-effect.dto");
const update_effect_dto_1 = require("../Dto/update-effect.dto");
let EffectController = class EffectController {
    effectService;
    constructor(effectService) {
        this.effectService = effectService;
    }
    async findAll() {
        return this.effectService.findAll();
    }
    async findOne(id) {
        return this.effectService.findOne(Number(id));
    }
    async create(data) {
        const payload = { ...data };
        if (data.visualEffectId)
            payload.visualEffect = { id: Number(data.visualEffectId) };
        delete payload.visualEffectId;
        return this.effectService.create(payload);
    }
    async update(id, data) {
        const payload = { ...data };
        if (data.visualEffectId)
            payload.visualEffect = { id: Number(data.visualEffectId) };
        delete payload.visualEffectId;
        return this.effectService.update(Number(id), payload);
    }
    async remove(id) {
        return this.effectService.remove(Number(id));
    }
};
exports.EffectController = EffectController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EffectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EffectController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_effect_dto_1.CreateEffectDto]),
    __metadata("design:returntype", Promise)
], EffectController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_effect_dto_1.UpdateEffectDto]),
    __metadata("design:returntype", Promise)
], EffectController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EffectController.prototype, "remove", null);
exports.EffectController = EffectController = __decorate([
    (0, common_1.Controller)('effects'),
    __metadata("design:paramtypes", [effect_service_1.EffectService])
], EffectController);
//# sourceMappingURL=effect.controller.js.map