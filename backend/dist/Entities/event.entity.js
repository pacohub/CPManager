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
exports.Event = exports.EventDifficulty = exports.EventType = void 0;
const typeorm_1 = require("typeorm");
const chapter_entity_1 = require("./chapter.entity");
const map_entity_1 = require("./map.entity");
var EventType;
(function (EventType) {
    EventType["EVENT"] = "EVENT";
    EventType["MISSION"] = "MISSION";
    EventType["SECONDARY_MISSION"] = "SECONDARY_MISSION";
    EventType["DAILY_MISSION"] = "DAILY_MISSION";
    EventType["WEEKLY_MISSION"] = "WEEKLY_MISSION";
    EventType["CINEMATIC"] = "CINEMATIC";
    EventType["MOBA"] = "MOBA";
})(EventType || (exports.EventType = EventType = {}));
var EventDifficulty;
(function (EventDifficulty) {
    EventDifficulty["EASY"] = "EASY";
    EventDifficulty["NORMAL"] = "NORMAL";
    EventDifficulty["HARD"] = "HARD";
})(EventDifficulty || (exports.EventDifficulty = EventDifficulty = {}));
let Event = class Event {
    id;
    position;
    name;
    description;
    type;
    difficulty;
    file;
    moba;
    dialogue;
    chapter;
    map;
};
exports.Event = Event;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Event.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Event.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 120 }),
    __metadata("design:type", String)
], Event.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Event.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Event.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Event.prototype, "moba", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Event.prototype, "dialogue", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chapter_entity_1.Chapter, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", chapter_entity_1.Chapter)
], Event.prototype, "chapter", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => map_entity_1.Map, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", map_entity_1.Map)
], Event.prototype, "map", void 0);
exports.Event = Event = __decorate([
    (0, typeorm_1.Entity)()
], Event);
//# sourceMappingURL=event.entity.js.map