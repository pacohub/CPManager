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
exports.CharacterTalentTree = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const talentTree_entity_1 = require("./talentTree.entity");
let CharacterTalentTree = class CharacterTalentTree {
    id;
    character;
    characterId;
    talentTree;
    talentTreeId;
    enabled;
};
exports.CharacterTalentTree = CharacterTalentTree;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CharacterTalentTree.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character, (c) => c.charTalentTreeFlags, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'characterId' }),
    __metadata("design:type", character_entity_1.Character)
], CharacterTalentTree.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CharacterTalentTree.prototype, "characterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => talentTree_entity_1.TalentTree, { eager: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'talentTreeId' }),
    __metadata("design:type", talentTree_entity_1.TalentTree)
], CharacterTalentTree.prototype, "talentTree", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CharacterTalentTree.prototype, "talentTreeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CharacterTalentTree.prototype, "enabled", void 0);
exports.CharacterTalentTree = CharacterTalentTree = __decorate([
    (0, typeorm_1.Entity)({ name: 'character_talent_tree' })
], CharacterTalentTree);
//# sourceMappingURL=characterTalentTree.entity.js.map