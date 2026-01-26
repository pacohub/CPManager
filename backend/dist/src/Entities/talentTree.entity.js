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
exports.TalentTree = void 0;
const typeorm_1 = require("typeorm");
const talentTreeTalent_entity_1 = require("./talentTreeTalent.entity");
const talentTreeLink_entity_1 = require("./talentTreeLink.entity");
let TalentTree = class TalentTree {
    id;
    name;
    file;
    entries;
    links;
};
exports.TalentTree = TalentTree;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TalentTree.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 140 }),
    __metadata("design:type", String)
], TalentTree.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TalentTree.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => talentTreeTalent_entity_1.TalentTreeTalent, (ttt) => ttt.talentTree, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], TalentTree.prototype, "entries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => talentTreeLink_entity_1.TalentTreeLink, (l) => l.talentTree, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], TalentTree.prototype, "links", void 0);
exports.TalentTree = TalentTree = __decorate([
    (0, typeorm_1.Entity)()
], TalentTree);
//# sourceMappingURL=talentTree.entity.js.map