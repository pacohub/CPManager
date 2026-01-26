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
exports.TalentTreeLink = void 0;
const typeorm_1 = require("typeorm");
const talentTree_entity_1 = require("./talentTree.entity");
let TalentTreeLink = class TalentTreeLink {
    id;
    talentTree;
    talentTreeId;
    fromX;
    fromY;
    toX;
    toY;
};
exports.TalentTreeLink = TalentTreeLink;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TalentTreeLink.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => talentTree_entity_1.TalentTree, (tt) => tt.links, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'talentTreeId' }),
    __metadata("design:type", talentTree_entity_1.TalentTree)
], TalentTreeLink.prototype, "talentTree", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], TalentTreeLink.prototype, "talentTreeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], TalentTreeLink.prototype, "fromX", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], TalentTreeLink.prototype, "fromY", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], TalentTreeLink.prototype, "toX", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], TalentTreeLink.prototype, "toY", void 0);
exports.TalentTreeLink = TalentTreeLink = __decorate([
    (0, typeorm_1.Entity)({ name: 'talent_tree_links' })
], TalentTreeLink);
//# sourceMappingURL=talentTreeLink.entity.js.map