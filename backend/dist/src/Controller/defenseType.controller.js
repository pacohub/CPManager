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
exports.DefenseTypeController = void 0;
const common_1 = require("@nestjs/common");
const defenseType_service_1 = require("../Services/defenseType.service");
let DefenseTypeController = class DefenseTypeController {
    defenseTypeService;
    constructor(defenseTypeService) {
        this.defenseTypeService = defenseTypeService;
    }
    async findAll() {
        return this.defenseTypeService.findAll();
    }
    async findOne(id) {
        return this.defenseTypeService.findOne(Number(id));
    }
    async create(data) {
        return this.defenseTypeService.create(data);
    }
    async update(id, data) {
        return this.defenseTypeService.update(Number(id), data);
    }
    async remove(id) {
        return this.defenseTypeService.remove(Number(id));
    }
};
exports.DefenseTypeController = DefenseTypeController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DefenseTypeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DefenseTypeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DefenseTypeController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DefenseTypeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DefenseTypeController.prototype, "remove", null);
exports.DefenseTypeController = DefenseTypeController = __decorate([
    (0, common_1.Controller)('defense-types'),
    __metadata("design:paramtypes", [defenseType_service_1.DefenseTypeService])
], DefenseTypeController);
//# sourceMappingURL=defenseType.controller.js.map