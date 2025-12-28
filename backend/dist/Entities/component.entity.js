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
exports.Component = exports.COMPONENT_TYPES = void 0;
const typeorm_1 = require("typeorm");
const map_entity_1 = require("./map.entity");
exports.COMPONENT_TYPES = [
    'puentes y rampas',
    'cinemático (efectos)',
    'efecto en terreno o paredes',
    'entorno (sin collider)',
    'adorno (con collider)',
    'estructura',
    'árboles y destructibles',
    'agua',
];
let Component = class Component {
    id;
    name;
    description;
    type;
    model;
    image;
    maps;
};
exports.Component = Component;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Component.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 140, unique: true }),
    __metadata("design:type", String)
], Component.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Component.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 80 }),
    __metadata("design:type", String)
], Component.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Component.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Component.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => map_entity_1.Map, (map) => map.components),
    __metadata("design:type", Array)
], Component.prototype, "maps", void 0);
exports.Component = Component = __decorate([
    (0, typeorm_1.Entity)()
], Component);
//# sourceMappingURL=component.entity.js.map