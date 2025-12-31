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
exports.Character = void 0;
const typeorm_1 = require("typeorm");
const animation_entity_1 = require("./animation.entity");
const class_entity_1 = require("./class.entity");
const race_entity_1 = require("./race.entity");
let Character = class Character {
    id;
    name;
    icon;
    image;
    model;
    parent;
    parentId;
    class;
    classId;
    race;
    raceId;
    children;
    animations;
};
exports.Character = Character;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Character.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], Character.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Character.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Character.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Character.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Character, (c) => c.children, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'parentId' }),
    __metadata("design:type", Object)
], Character.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Character.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_entity_1.Class, { nullable: false, cascade: false }),
    (0, typeorm_1.JoinColumn)({ name: 'classId' }),
    __metadata("design:type", class_entity_1.Class)
], Character.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Character.prototype, "classId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => race_entity_1.Race, { nullable: true, cascade: false, eager: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'raceId' }),
    __metadata("design:type", Object)
], Character.prototype, "race", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Character.prototype, "raceId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Character, (c) => c.parent),
    __metadata("design:type", Array)
], Character.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => animation_entity_1.Animation, (animation) => animation.characters),
    (0, typeorm_1.JoinTable)({ name: 'character_animations' }),
    __metadata("design:type", Array)
], Character.prototype, "animations", void 0);
exports.Character = Character = __decorate([
    (0, typeorm_1.Entity)()
], Character);
//# sourceMappingURL=character.entity.js.map