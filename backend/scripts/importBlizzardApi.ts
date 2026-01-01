import { DataSource } from 'typeorm';
import * as path from 'path';
import { Skill } from '../src/Entities/skill.entity';

// Usage:
// set env vars BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET, then run:
// npm run import:blizzard-api -- --region=us --locale=es_ES --batch=0

async function getToken(clientId: string, clientSecret: string) {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://oauth.battle.net/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${res.statusText}`);
  const j = await res.json();
  return j.access_token as string;
}

function sleep(ms: number) {
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
  const argMap: Record<string, string> = {};
  for (const a of args) {
    const [k, v] = a.replace(/^--/, '').split('=');
    argMap[k] = v ?? 'true';
  }
  const region = (argMap.region || 'us').toLowerCase(); // us | eu | kr | tw | cn
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
  if (!idxRes.ok) throw new Error(`Index fetch failed: ${idxRes.status} ${idxRes.statusText}`);
  const idxJson = await idxRes.json();
  const entries: Array<{ id: number; name?: string }> = idxJson.spells ?? idxJson.results ?? [];
  console.log(`Index contains ${entries.length} entries`);

  const dbPath = path.join(__dirname, '..', 'database.sqlite');
  const ds = new DataSource({
    type: 'sqlite',
    database: dbPath,
    entities: [Skill],
    synchronize: false,
  });
  await ds.initialize();
  const repo = ds.getRepository(Skill);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let processed = 0;

  for (const e of entries) {
    if (limit && processed >= limit) break;
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
      // Try common shapes for name/description
      const name = (det.name && typeof det.name === 'string') ? det.name : (det?.name?.[locale] ?? det?.name?.en_US ?? det?.name?.es_ES ?? det?.name?.['en_US'] ?? det?.name?.value ?? det?.name ?? null);
      const description = det.description ?? det?.description?.value ?? det?.effects?.map((x: any) => x.description).filter(Boolean).join('\n') ?? null;
      if (!name) {
        console.warn('No name for id', id);
        skipped++;
        continue;
      }

      const existing = await repo.findOneBy({ id } as any);
      if (existing && !overwrite) {
        skipped++;
      } else if (existing) {
        existing.name = String(name).substring(0, 140);
        existing.description = description ?? null;
        await repo.save(existing as any);
        updated++;
      } else {
        // Insert with explicit id
        const ent = repo.create({ id, name: String(name).substring(0, 140), description: description ?? null } as any);
        await repo.insert(ent as any);
        inserted++;
      }

      // be polite with rate limits
      await sleep(120);
    } catch (err: any) {
      console.error('Error processing id', id, err?.message ?? err);
    }
  }

  console.log(`Done. inserted=${inserted} updated=${updated} skipped=${skipped}`);
  await ds.destroy();
}

main().catch((e) => { console.error(e); process.exit(1); });
