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
exports.VisualEffectController = void 0;
const common_1 = require("@nestjs/common");
const visualEffect_service_1 = require("../Services/visualEffect.service");
const create_visualEffect_dto_1 = require("../Dto/create-visualEffect.dto");
const update_visualEffect_dto_1 = require("../Dto/update-visualEffect.dto");
let VisualEffectController = class VisualEffectController {
    visualEffectService;
    constructor(visualEffectService) {
        this.visualEffectService = visualEffectService;
    }
    async findAll() {
        return this.visualEffectService.findAll();
    }
    async findOne(id) {
        return this.visualEffectService.findOne(Number(id));
    }
    async create(data) {
        const payload = { ...data };
        if (data.soundId)
            payload.sound = { id: Number(data.soundId) };
        delete payload.soundId;
        return this.visualEffectService.create(payload);
    }
    async update(id, data) {
        const payload = { ...data };
        if (data.soundId)
            payload.sound = { id: Number(data.soundId) };
        delete payload.soundId;
        return this.visualEffectService.update(Number(id), payload);
    }
    async remove(id) {
        return this.visualEffectService.remove(Number(id));
    }
};
exports.VisualEffectController = VisualEffectController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VisualEffectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VisualEffectController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_visualEffect_dto_1.CreateVisualEffectDto]),
    __metadata("design:returntype", Promise)
], VisualEffectController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_visualEffect_dto_1.UpdateVisualEffectDto]),
    __metadata("design:returntype", Promise)
], VisualEffectController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VisualEffectController.prototype, "remove", null);
exports.VisualEffectController = VisualEffectController = __decorate([
    (0, common_1.Controller)('visual-effects'),
    __metadata("design:paramtypes", [visualEffect_service_1.VisualEffectService])
], VisualEffectController);
//# sourceMappingURL=visualEffect.controller.js.map