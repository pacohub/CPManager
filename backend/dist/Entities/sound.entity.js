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
exports.Sound = void 0;
const typeorm_1 = require("typeorm");
const armorType_entity_1 = require("./armorType.entity");
const soundType_entity_1 = require("./soundType.entity");
let Sound = class Sound {
    id;
    name;
    file;
    types;
    armorTypes;
};
exports.Sound = Sound;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Sound.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 140, unique: true }),
    __metadata("design:type", String)
], Sound.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Sound.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => soundType_entity_1.SoundType, (t) => t.sounds, { eager: true }),
    (0, typeorm_1.JoinTable)({ name: 'sound_types' }),
    __metadata("design:type", Array)
], Sound.prototype, "types", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => armorType_entity_1.ArmorType, (a) => a.sounds),
    __metadata("design:type", Array)
], Sound.prototype, "armorTypes", void 0);
exports.Sound = Sound = __decorate([
    (0, typeorm_1.Entity)()
], Sound);
//# sourceMappingURL=sound.entity.js.map