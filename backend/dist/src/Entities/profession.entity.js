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
exports.Profession = void 0;
const typeorm_1 = require("typeorm");
const faction_entity_1 = require("./faction.entity");
let Profession = class Profession {
    id;
    name;
    description;
    link;
    factions;
};
exports.Profession = Profession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Profession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120, unique: true }),
    __metadata("design:type", String)
], Profession.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Profession.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Profession.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => faction_entity_1.Faction, (f) => f.professions),
    __metadata("design:type", Array)
], Profession.prototype, "factions", void 0);
exports.Profession = Profession = __decorate([
    (0, typeorm_1.Entity)()
], Profession);
//# sourceMappingURL=profession.entity.js.map