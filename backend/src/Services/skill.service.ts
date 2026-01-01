import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../Entities/skill.entity';
import * as path from 'path';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  async findAll(): Promise<Skill[]> {
    return this.skillRepository
      .createQueryBuilder('skill')
      .orderBy('LOWER(skill.name)', 'ASC')
      .addOrderBy('skill.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Skill | null> {
    return this.skillRepository.findOneBy({ id });
  }

  async create(data: Partial<Skill>): Promise<Skill> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (typeof data.description === 'string') data.description = data.description.trim();
    const s = this.skillRepository.create(data);
    return this.skillRepository.save(s);
  }

  async update(id: number, data: Partial<Skill>): Promise<Skill | null> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (typeof data.description === 'string') data.description = data.description.trim();
    await this.skillRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.skillRepository.delete(id);
  }

  // Import missing skills from Blizzard API: only insert skills that do not exist
  async importFromBlizzard(options: { region?: string; locale?: string; limit?: number } = {}): Promise<{ inserted: number; skipped: number }> {
    const region = (options.region || 'us').toLowerCase();
    const locale = options.locale || (region === 'eu' ? 'es_ES' : 'en_US');
    const limit = options.limit && Number.isFinite(options.limit) ? options.limit : undefined;

    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('BLIZZARD_CLIENT_ID/BLIZZARD_CLIENT_SECRET not set in environment');

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    // obtain token
    const tokenRes = await fetch('https://oauth.battle.net/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    if (!tokenRes.ok) throw new Error(`Token fetch failed: ${tokenRes.status}`);
    const tokenJson = await tokenRes.json();
    const token = tokenJson.access_token as string;

    const base = `https://${region}.api.blizzard.com`;
    const namespace = `static-${region}`;

    const idxUrl = `${base}/data/wow/spell/index?namespace=${namespace}&locale=${locale}&access_token=${token}`;
    const idxRes = await fetch(idxUrl);
    if (!idxRes.ok) throw new Error(`Index fetch failed: ${idxRes.status}`);
    const idxJson = await idxRes.json();
    const entries: Array<{ id: number }> = idxJson.spells ?? idxJson.results ?? [];

    let inserted = 0;
    let skipped = 0;
    let processed = 0;

    for (const e of entries) {
      if (limit && processed >= limit) break;
      processed++;
      const id = e.id;
      try {
        const exists = await this.skillRepository.findOneBy({ id } as any);
        if (exists) {
          skipped++;
          continue;
        }
        // fetch detail
        const detailUrl = `${base}/data/wow/spell/${id}?namespace=${namespace}&locale=${locale}&access_token=${token}`;
        const detRes = await fetch(detailUrl);
        if (!detRes.ok) {
          skipped++;
          continue;
        }
        const det = await detRes.json();
        const name = det.name && typeof det.name === 'string' ? det.name : (det?.name?.[locale] ?? det?.name?.en_US ?? det?.name ?? null);
        let description: string | null = null;
        if (det.description) description = String(det.description);
        else if (det.effects && Array.isArray(det.effects)) description = det.effects.map((x: any) => x.description || '').filter(Boolean).join('\n');
        else description = null;

        // If there are other relevant fields, append them to description
        const extras: string[] = [];
        if (det.cast_time) extras.push(`Cast time: ${JSON.stringify(det.cast_time)}`);
        if (det.range) extras.push(`Range: ${JSON.stringify(det.range)}`);
        if (det.cooldown) extras.push(`Cooldown: ${JSON.stringify(det.cooldown)}`);
        if (det.power_cost) extras.push(`Power cost: ${JSON.stringify(det.power_cost)}`);
        if (extras.length) {
          const extraText = extras.join('\n');
          description = (description ? description + '\n\n' : '') + extraText;
        }

        const ent = this.skillRepository.create({ id, name: String(name).substring(0, 140), description: description ?? null } as any);
        await this.skillRepository.insert(ent as any);
        inserted++;
      } catch (err) {
        skipped++;
      }
    }

    return { inserted, skipped };
  }
}
