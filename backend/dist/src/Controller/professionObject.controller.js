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
exports.ProfessionObjectController = void 0;
const common_1 = require("@nestjs/common");
const professionObject_service_1 = require("../Services/professionObject.service");
let ProfessionObjectController = class ProfessionObjectController {
    professionObjectService;
    constructor(professionObjectService) {
        this.professionObjectService = professionObjectService;
    }
    async getForProfession(professionId) {
        return this.professionObjectService.findByProfession(Number(professionId));
    }
    async replaceForProfession(professionId, body) {
        return this.professionObjectService.replaceForProfession(Number(professionId), body?.links ?? []);
    }
};
exports.ProfessionObjectController = ProfessionObjectController;
__decorate([
    (0, common_1.Get)(':professionId'),
    __param(0, (0, common_1.Param)('professionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfessionObjectController.prototype, "getForProfession", null);
__decorate([
    (0, common_1.Put)(':professionId'),
    __param(0, (0, common_1.Param)('professionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProfessionObjectController.prototype, "replaceForProfession", null);
exports.ProfessionObjectController = ProfessionObjectController = __decorate([
    (0, common_1.Controller)('profession-objects'),
    __metadata("design:paramtypes", [professionObject_service_1.ProfessionObjectService])
], ProfessionObjectController);
//# sourceMappingURL=professionObject.controller.js.map