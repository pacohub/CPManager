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
exports.ObjectiveController = void 0;
const common_1 = require("@nestjs/common");
const objective_service_1 = require("../Services/objective.service");
let ObjectiveController = class ObjectiveController {
    objectiveService;
    constructor(objectiveService) {
        this.objectiveService = objectiveService;
    }
    async findAll(eventId, mechanicId, chapterId) {
        const filters = {};
        if (eventId !== undefined && eventId !== null && eventId !== '')
            filters.eventId = Number(eventId);
        if (mechanicId !== undefined && mechanicId !== null && mechanicId !== '')
            filters.mechanicId = Number(mechanicId);
        if (chapterId !== undefined && chapterId !== null && chapterId !== '')
            filters.chapterId = Number(chapterId);
        return this.objectiveService.findAll(filters);
    }
    async findOne(id) {
        return this.objectiveService.findOne(Number(id));
    }
    async create(data) {
        return this.objectiveService.create(data);
    }
    async update(id, data) {
        return this.objectiveService.update(Number(id), data);
    }
    async remove(id) {
        return this.objectiveService.remove(Number(id));
    }
};
exports.ObjectiveController = ObjectiveController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('eventId')),
    __param(1, (0, common_1.Query)('mechanicId')),
    __param(2, (0, common_1.Query)('chapterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ObjectiveController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ObjectiveController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectiveController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ObjectiveController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ObjectiveController.prototype, "remove", null);
exports.ObjectiveController = ObjectiveController = __decorate([
    (0, common_1.Controller)('objectives'),
    __metadata("design:paramtypes", [objective_service_1.ObjectiveService])
], ObjectiveController);
//# sourceMappingURL=objective.controller.js.map