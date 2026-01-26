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
exports.TalentTreeTalent = void 0;
const typeorm_1 = require("typeorm");
const talentTree_entity_1 = require("./talentTree.entity");
const talent_entity_1 = require("./talent.entity");
let TalentTreeTalent = class TalentTreeTalent {
    id;
    talentTree;
    talentTreeId;
    talent;
    talentId;
    posX;
    posY;
    order;
};
exports.TalentTreeTalent = TalentTreeTalent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TalentTreeTalent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => talentTree_entity_1.TalentTree, (tt) => tt.entries, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'talentTreeId' }),
    __metadata("design:type", talentTree_entity_1.TalentTree)
], TalentTreeTalent.prototype, "talentTree", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], TalentTreeTalent.prototype, "talentTreeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => talent_entity_1.Talent, (t) => t.treeEntries, { eager: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'talentId' }),
    __metadata("design:type", talent_entity_1.Talent)
], TalentTreeTalent.prototype, "talent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], TalentTreeTalent.prototype, "talentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], TalentTreeTalent.prototype, "posX", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], TalentTreeTalent.prototype, "posY", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], TalentTreeTalent.prototype, "order", void 0);
exports.TalentTreeTalent = TalentTreeTalent = __decorate([
    (0, typeorm_1.Entity)({ name: 'talent_tree_talents' })
], TalentTreeTalent);
//# sourceMappingURL=talentTreeTalent.entity.js.map