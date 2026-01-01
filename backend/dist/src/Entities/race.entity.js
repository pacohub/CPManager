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
exports.Race = exports.RACE_MOVEMENT_TYPES = exports.RACE_DEATH_TYPES = void 0;
const typeorm_1 = require("typeorm");
const animation_entity_1 = require("./animation.entity");
const armorType_entity_1 = require("./armorType.entity");
const sound_entity_1 = require("./sound.entity");
exports.RACE_DEATH_TYPES = [
    'no revive, no se pudre',
    'revive, no se pudre',
    'revive, se pudre',
    'no revive, se pudre',
];
exports.RACE_MOVEMENT_TYPES = [
    'ninguno',
    'a pie',
    'jinete',
    'vuela',
    'levita',
    'flota',
    'anfibio',
];
let Race = class Race {
    id;
    name;
    icon;
    deathType;
    baseDefense;
    movementSpeed;
    movementType;
    attack1;
    attack2;
    defenseType;
    movementSound;
    movementSoundId;
    lifeRegen;
    baseLife;
    baseMana;
    baseManaRegen;
    initialMana;
    transportSize;
    armorType;
    armorTypeEntity;
    armorTypeId;
    animations;
};
exports.Race = Race;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Race.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 140, unique: true }),
    __metadata("design:type", String)
], Race.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Race.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Race.prototype, "deathType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Race.prototype, "baseDefense", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Race.prototype, "movementSpeed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Race.prototype, "movementType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Race.prototype, "attack1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Race.prototype, "attack2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Race.prototype, "defenseType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sound_entity_1.Sound, { nullable: true, eager: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'movementSoundId' }),
    __metadata("design:type", Object)
], Race.prototype, "movementSound", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Race.prototype, "movementSoundId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'real', default: 0 }),
    __metadata("design:type", Number)
], Race.prototype, "lifeRegen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Race.prototype, "baseLife", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Race.prototype, "baseMana", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'real', default: 0 }),
    __metadata("design:type", Number)
], Race.prototype, "baseManaRegen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Race.prototype, "initialMana", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Race.prototype, "transportSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Race.prototype, "armorType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => armorType_entity_1.ArmorType, { nullable: true, eager: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'armorTypeId' }),
    __metadata("design:type", Object)
], Race.prototype, "armorTypeEntity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Race.prototype, "armorTypeId", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => animation_entity_1.Animation, (animation) => animation.races),
    (0, typeorm_1.JoinTable)({ name: 'race_animations' }),
    __metadata("design:type", Array)
], Race.prototype, "animations", void 0);
exports.Race = Race = __decorate([
    (0, typeorm_1.Entity)()
], Race);
//# sourceMappingURL=race.entity.js.map