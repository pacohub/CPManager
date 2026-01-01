"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const skill_entity_1 = require("../src/Entities/skill.entity");
async function main() {
    const fileArg = process.argv[2] || 'blizzard-skills.json';
    const filePath = path.isAbsolute(fileArg) ? fileArg : path.join(__dirname, fileArg);
    if (!fs.existsSync(filePath)) {
        console.error('Input file not found:', filePath);
        process.exit(2);
    }
    const raw = fs.readFileSync(filePath, { encoding: 'utf8' });
    let items = [];
    try {
        items = JSON.parse(raw);
        if (!Array.isArray(items))
            throw new Error('Expected an array');
    }
    catch (err) {
        console.error('Failed to parse JSON file:', err);
        process.exit(3);
    }
    const dataSource = new typeorm_1.DataSource({
        type: 'sqlite',
        database: path.join(__dirname, '..', 'database.sqlite'),
        entities: [skill_entity_1.Skill],
        synchronize: false,
    });
    await dataSource.initialize();
    const repo = dataSource.getRepository(skill_entity_1.Skill);
    let inserted = 0;
    let updated = 0;
    for (const it of items) {
        if (!it || typeof it.id !== 'number' || !it.name)
            continue;
        try {
            const payload = { id: it.id, name: String(it.name).substring(0, 140) };
            if (typeof it.description === 'string' && it.description.trim() !== '')
                payload.description = it.description;
            const existing = await repo.findOneBy({ id: it.id });
            if (existing) {
                await repo.save({ ...existing, ...payload });
                updated++;
            }
            else {
                await repo.insert(payload);
                inserted++;
            }
        }
        catch (e) {
            console.error('Failed to upsert skill id=', it.id, e.message || e);
        }
    }
    console.log(`Inserted: ${inserted}, Updated: ${updated}`);
    await dataSource.destroy();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=importBlizzardSkills.js.map