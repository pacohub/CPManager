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
exports.ProfessionObjectResourceController = void 0;
const common_1 = require("@nestjs/common");
const professionObjectResource_service_1 = require("../Services/professionObjectResource.service");
let ProfessionObjectResourceController = class ProfessionObjectResourceController {
    professionObjectResourceService;
    constructor(professionObjectResourceService) {
        this.professionObjectResourceService = professionObjectResourceService;
    }
    async byProfession(professionId) {
        const id = Number(professionId);
        if (!Number.isFinite(id))
            return {};
        const list = await this.professionObjectResourceService.findByProfession(id);
        const map = {};
        for (const item of list) {
            if (!map[item.objectId])
                map[item.objectId] = [];
            map[item.objectId].push(item);
        }
        return map;
    }
    async getForObject(professionId, objectId) {
        return this.professionObjectResourceService.findForObject(Number(professionId), Number(objectId));
    }
    async replaceForObject(professionId, objectId, body) {
        return this.professionObjectResourceService.replaceForObject(Number(professionId), Number(objectId), body?.links ?? []);
    }
};
exports.ProfessionObjectResourceController = ProfessionObjectResourceController;
__decorate([
    (0, common_1.Get)('by-profession'),
    __param(0, (0, common_1.Query)('professionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfessionObjectResourceController.prototype, "byProfession", null);
__decorate([
    (0, common_1.Get)(':professionId/:objectId'),
    __param(0, (0, common_1.Param)('professionId')),
    __param(1, (0, common_1.Param)('objectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProfessionObjectResourceController.prototype, "getForObject", null);
__decorate([
    (0, common_1.Put)(':professionId/:objectId'),
    __param(0, (0, common_1.Param)('professionId')),
    __param(1, (0, common_1.Param)('objectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProfessionObjectResourceController.prototype, "replaceForObject", null);
exports.ProfessionObjectResourceController = ProfessionObjectResourceController = __decorate([
    (0, common_1.Controller)('profession-object-resources'),
    __metadata("design:paramtypes", [professionObjectResource_service_1.ProfessionObjectResourceService])
], ProfessionObjectResourceController);
//# sourceMappingURL=professionObjectResource.controller.js.map