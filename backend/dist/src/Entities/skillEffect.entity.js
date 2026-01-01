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
exports.SkillEffect = exports.AppliesTo = void 0;
const typeorm_1 = require("typeorm");
const skill_entity_1 = require("./skill.entity");
const effect_entity_1 = require("./effect.entity");
var AppliesTo;
(function (AppliesTo) {
    AppliesTo["TARGET"] = "TARGET";
    AppliesTo["CASTER"] = "CASTER";
    AppliesTo["ZONAL_ALL"] = "ZONAL_ALL";
    AppliesTo["ZONAL_ENEMY"] = "ZONAL_ENEMY";
    AppliesTo["ZONAL_ALLY"] = "ZONAL_ALLY";
})(AppliesTo || (exports.AppliesTo = AppliesTo = {}));
let SkillEffect = class SkillEffect {
    id;
    skill;
    effect;
    appliesTo;
};
exports.SkillEffect = SkillEffect;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SkillEffect.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_entity_1.Skill, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", skill_entity_1.Skill)
], SkillEffect.prototype, "skill", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => effect_entity_1.Effect, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", effect_entity_1.Effect)
], SkillEffect.prototype, "effect", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: AppliesTo.TARGET }),
    __metadata("design:type", String)
], SkillEffect.prototype, "appliesTo", void 0);
exports.SkillEffect = SkillEffect = __decorate([
    (0, typeorm_1.Entity)({ name: 'skill_effects' })
], SkillEffect);
//# sourceMappingURL=skillEffect.entity.js.map