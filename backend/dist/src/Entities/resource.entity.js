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
exports.Resource = void 0;
const typeorm_1 = require("typeorm");
const chapter_entity_1 = require("./chapter.entity");
const resourceType_entity_1 = require("./resourceType.entity");
let Resource = class Resource {
    id;
    name;
    description;
    icon;
    fileLink;
    resourceType;
    chapters;
};
exports.Resource = Resource;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Resource.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 140, unique: true }),
    __metadata("design:type", String)
], Resource.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Resource.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Resource.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Resource.prototype, "fileLink", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => resourceType_entity_1.ResourceType, { eager: true, onDelete: 'RESTRICT' }),
    __metadata("design:type", resourceType_entity_1.ResourceType)
], Resource.prototype, "resourceType", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => chapter_entity_1.Chapter, (chapter) => chapter.resources),
    __metadata("design:type", Array)
], Resource.prototype, "chapters", void 0);
exports.Resource = Resource = __decorate([
    (0, typeorm_1.Entity)()
], Resource);
//# sourceMappingURL=resource.entity.js.map