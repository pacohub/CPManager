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
exports.Animation = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const class_entity_1 = require("./class.entity");
const race_entity_1 = require("./race.entity");
let Animation = class Animation {
    id;
    name;
    races;
    classes;
    characters;
};
exports.Animation = Animation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Animation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 140, unique: true }),
    __metadata("design:type", String)
], Animation.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => race_entity_1.Race, (race) => race.animations),
    __metadata("design:type", Array)
], Animation.prototype, "races", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => class_entity_1.Class, (klass) => klass.animations),
    __metadata("design:type", Array)
], Animation.prototype, "classes", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => character_entity_1.Character, (character) => character.animations),
    __metadata("design:type", Array)
], Animation.prototype, "characters", void 0);
exports.Animation = Animation = __decorate([
    (0, typeorm_1.Entity)()
], Animation);
//# sourceMappingURL=animation.entity.js.map