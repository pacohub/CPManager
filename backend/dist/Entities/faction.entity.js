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
exports.Faction = void 0;
const typeorm_1 = require("typeorm");
const profession_entity_1 = require("./profession.entity");
let Faction = class Faction {
    id;
    name;
    description;
    crestImage;
    iconImage;
    primaryColor;
    secondaryColor;
    tertiaryColor;
    file;
    professions;
};
exports.Faction = Faction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Faction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], Faction.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Faction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Faction.prototype, "crestImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Faction.prototype, "iconImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Faction.prototype, "primaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Faction.prototype, "secondaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Faction.prototype, "tertiaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Faction.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => profession_entity_1.Profession, (p) => p.factions, { cascade: false }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Faction.prototype, "professions", void 0);
exports.Faction = Faction = __decorate([
    (0, typeorm_1.Entity)()
], Faction);
//# sourceMappingURL=faction.entity.js.map