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
exports.Talent = void 0;
const typeorm_1 = require("typeorm");
const skill_entity_1 = require("./skill.entity");
const visualEffect_entity_1 = require("./visualEffect.entity");
const talentTreeTalent_entity_1 = require("./talentTreeTalent.entity");
let Talent = class Talent {
    id;
    name;
    description;
    icon;
    file;
    skills;
    visuals;
    treeEntries;
};
exports.Talent = Talent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Talent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 140 }),
    __metadata("design:type", String)
], Talent.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => skill_entity_1.Skill),
    (0, typeorm_1.JoinTable)({ name: 'talent_skills' }),
    __metadata("design:type", Array)
], Talent.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => visualEffect_entity_1.VisualEffect),
    (0, typeorm_1.JoinTable)({ name: 'talent_visuals' }),
    __metadata("design:type", Array)
], Talent.prototype, "visuals", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => talentTreeTalent_entity_1.TalentTreeTalent, (ttt) => ttt.talent),
    __metadata("design:type", Array)
], Talent.prototype, "treeEntries", void 0);
exports.Talent = Talent = __decorate([
    (0, typeorm_1.Entity)()
], Talent);
//# sourceMappingURL=talent.entity.js.map