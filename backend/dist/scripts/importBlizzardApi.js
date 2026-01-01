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
const path = __importStar(require("path"));
const skill_entity_1 = require("../src/Entities/skill.entity");
async function getToken(clientId, clientSecret) {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://oauth.battle.net/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!res.ok)
        throw new Error(`Token request failed: ${res.status} ${res.statusText}`);
    const j = await res.json();
    return j.access_token;
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
async function main() {
    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        console.error('Set BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET env vars');
        process.exit(2);
    }
    const args = process.argv.slice(2);
    const argMap = {};
    for (const a of args) {
        const [k, v] = a.replace(/^--/, '').split('=');
        argMap[k] = v ?? 'true';
    }
    const region = (argMap.region || 'us').toLowerCase();
    const locale = argMap.locale || (region === 'eu' ? 'es_ES' : 'en_US');
    const overwrite = argMap.overwrite === 'true' || argMap.overwrite === '1';
    const limit = argMap.limit ? Number(argMap.limit) : undefined;
    console.log('Blizzard import starting', { region, locale, overwrite, limit });
    const token = await getToken(clientId, clientSecret);
    const base = `https://${region}.api.blizzard.com`;
    const namespace = `static-${region}`;
    console.log('Fetching spell index from Blizzard...');
    const idxUrl = `${base}/data/wow/spell/index?namespace=${namespace}&locale=${locale}&access_token=${token}`;
    const idxRes = await fetch(idxUrl);
    if (!idxRes.ok)
        throw new Error(`Index fetch failed: ${idxRes.status} ${idxRes.statusText}`);
    const idxJson = await idxRes.json();
    const entries = idxJson.spells ?? idxJson.results ?? [];
    console.log(`Index contains ${entries.length} entries`);
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    const ds = new typeorm_1.DataSource({
        type: 'sqlite',
        database: dbPath,
        entities: [skill_entity_1.Skill],
        synchronize: false,
    });
    await ds.initialize();
    const repo = ds.getRepository(skill_entity_1.Skill);
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let processed = 0;
    for (const e of entries) {
        if (limit && processed >= limit)
            break;
        processed++;
        const id = e.id;
        try {
            const detailUrl = `${base}/data/wow/spell/${id}?namespace=${namespace}&locale=${locale}&access_token=${token}`;
            const detRes = await fetch(detailUrl);
            if (!detRes.ok) {
                console.warn(`Failed fetching spell ${id}: ${detRes.status}`);
                await sleep(100);
                continue;
            }
            const det = await detRes.json();
            const name = (det.name && typeof det.name === 'string') ? det.name : (det?.name?.[locale] ?? det?.name?.en_US ?? det?.name?.es_ES ?? det?.name?.['en_US'] ?? det?.name?.value ?? det?.name ?? null);
            const description = det.description ?? det?.description?.value ?? det?.effects?.map((x) => x.description).filter(Boolean).join('\n') ?? null;
            if (!name) {
                console.warn('No name for id', id);
                skipped++;
                continue;
            }
            const existing = await repo.findOneBy({ id });
            if (existing && !overwrite) {
                skipped++;
            }
            else if (existing) {
                existing.name = String(name).substring(0, 140);
                existing.description = description ?? null;
                await repo.save(existing);
                updated++;
            }
            else {
                const ent = repo.create({ id, name: String(name).substring(0, 140), description: description ?? null });
                await repo.insert(ent);
                inserted++;
            }
            await sleep(120);
        }
        catch (err) {
            console.error('Error processing id', id, err?.message ?? err);
        }
    }
    console.log(`Done. inserted=${inserted} updated=${updated} skipped=${skipped}`);
    await ds.destroy();
}
main().catch((e) => { console.error(e); process.exit(1); });
//# sourceMappingURL=importBlizzardApi.js.map