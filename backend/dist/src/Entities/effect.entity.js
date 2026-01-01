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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Effect = void 0;
const typeorm_1 = require("typeorm");
const visualEffect_entity_1 = require("./visualEffect.entity");
let Effect = class Effect {
    id;
    name;
    description;
    type;
    benefit;
    file;
    visualEffect;
};
exports.Effect = Effect;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Effect.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 140 }),
    __metadata("design:type", String)
], Effect.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Effect.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 60, nullable: true }),
    __metadata("design:type", String)
], Effect.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Effect.prototype, "benefit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Effect.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visualEffect_entity_1.VisualEffect, { eager: true, nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", Object)
], Effect.prototype, "visualEffect", void 0);
exports.Effect = Effect = __decorate([
    (0, typeorm_1.Entity)()
], Effect);
//# sourceMappingURL=effect.entity.js.map