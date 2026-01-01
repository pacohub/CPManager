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
exports.Skill = void 0;
const typeorm_1 = require("typeorm");
const visualEffect_entity_1 = require("./visualEffect.entity");
const skillEffect_entity_1 = require("./skillEffect.entity");
let Skill = class Skill {
    id;
    name;
    description;
    icon;
    levels;
    file;
    casterVisual;
    missileVisual;
    targetVisual;
    effects;
};
exports.Skill = Skill;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Skill.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 140 }),
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Skill.prototype, "levels", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visualEffect_entity_1.VisualEffect, { eager: true, nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", Object)
], Skill.prototype, "casterVisual", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visualEffect_entity_1.VisualEffect, { eager: true, nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", Object)
], Skill.prototype, "missileVisual", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visualEffect_entity_1.VisualEffect, { eager: true, nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", Object)
], Skill.prototype, "targetVisual", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => skillEffect_entity_1.SkillEffect, (se) => se.skill),
    __metadata("design:type", Array)
], Skill.prototype, "effects", void 0);
exports.Skill = Skill = __decorate([
    (0, typeorm_1.Entity)()
], Skill);
//# sourceMappingURL=skill.entity.js.map