import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Skill } from '../src/Entities/skill.entity';

async function main() {
  const fileArg = process.argv[2] || 'blizzard-skills.json';
  const filePath = path.isAbsolute(fileArg) ? fileArg : path.join(__dirname, fileArg);

  if (!fs.existsSync(filePath)) {
    console.error('Input file not found:', filePath);
    process.exit(2);
  }

  const raw = fs.readFileSync(filePath, { encoding: 'utf8' });
  let items: Array<{ id: number; name: string; description?: string }> = [];
  try {
    items = JSON.parse(raw);
    if (!Array.isArray(items)) throw new Error('Expected an array');
  } catch (err) {
    console.error('Failed to parse JSON file:', err);
    process.exit(3);
  }

  const dataSource = new DataSource({
    type: 'sqlite',
    database: path.join(__dirname, '..', 'database.sqlite'),
    entities: [Skill],
    synchronize: false,
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(Skill);

  let inserted = 0;
  let updated = 0;
  for (const it of items) {
    if (!it || typeof it.id !== 'number' || !it.name) continue;
    try {
      // Build a plain object and avoid passing null for description to satisfy typings
      const payload: any = { id: it.id, name: String(it.name).substring(0, 140) };
      if (typeof it.description === 'string' && it.description.trim() !== '') payload.description = it.description;
      const existing = await repo.findOneBy({ id: it.id } as any);
      if (existing) {
        await repo.save({ ...existing, ...payload });
        updated++;
      } else {
        await repo.insert(payload as any);
        inserted++;
      }
    } catch (e) {
      console.error('Failed to upsert skill id=', it.id, (e as any).message || e);
    }
  }

  console.log(`Inserted: ${inserted}, Updated: ${updated}`);
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
