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
exports.SagaController = void 0;
const common_1 = require("@nestjs/common");
const saga_service_1 = require("../Services/saga.service");
let SagaController = class SagaController {
    sagaService;
    constructor(sagaService) {
        this.sagaService = sagaService;
    }
    findAll() {
        return this.sagaService.findAll();
    }
    findOne(id) {
        return this.sagaService.findOne(Number(id));
    }
    create(data) {
        return this.sagaService.create(data);
    }
    update(id, data) {
        const { ids, ...safeData } = data;
        return this.sagaService.update(Number(id), safeData);
    }
    remove(id) {
        return this.sagaService.remove(Number(id));
    }
    async updateOrder(body) {
        return this.sagaService.saveOrder(body.ids);
    }
};
exports.SagaController = SagaController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SagaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SagaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SagaController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SagaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SagaController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)('order'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SagaController.prototype, "updateOrder", null);
exports.SagaController = SagaController = __decorate([
    (0, common_1.Controller)('sagas'),
    __metadata("design:paramtypes", [saga_service_1.SagaService])
], SagaController);
//# sourceMappingURL=saga.controller.js.map