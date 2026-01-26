import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TalentTree } from '../Entities/talentTree.entity';
import { TalentTreeTalent } from '../Entities/talentTreeTalent.entity';
import { TalentTreeLink } from '../Entities/talentTreeLink.entity';
import { Talent } from '../Entities/talent.entity';

@Injectable()
export class TalentTreeService {
  constructor(
    @InjectRepository(TalentTree)
    private treeRepository: Repository<TalentTree>,
    @InjectRepository(TalentTreeTalent)
    private entryRepository: Repository<TalentTreeTalent>,
    @InjectRepository(TalentTreeLink)
    private linkRepository: Repository<TalentTreeLink>,
    @InjectRepository(Talent)
    private talentRepository: Repository<Talent>,
  ) {}

  async findAll(): Promise<TalentTree[]> {
    return this.treeRepository.find({ relations: { entries: true, links: true } as any });
  }

  async findOne(id: number): Promise<TalentTree | null> {
    return this.treeRepository.findOne({ where: { id }, relations: { entries: { talent: true }, links: true } as any });
  }

  async create(data: Partial<TalentTree>): Promise<TalentTree> {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) throw new BadRequestException('name es requerido');
    const t = this.treeRepository.create({ name: data.name.trim(), file: data.file ?? null } as any);
    const saved = (await this.treeRepository.save(t)) as unknown as TalentTree;
    if (Array.isArray((data as any).entries) && (data as any).entries.length) {
      const entries = (data as any).entries as any[];
      for (const e of entries) {
        const tid = Number(e.talentId);
        if (!Number.isFinite(tid)) continue;
        const talent = await this.talentRepository.findOneBy({ id: tid } as any);
        if (!talent) continue;
        const ent = this.entryRepository.create({ talentTree: saved, talent, posX: Number(e.posX) || 0, posY: Number(e.posY) || 0, order: Number(e.order) || 0 } as any);
        await this.entryRepository.save(ent);
      }
    }
    // links
    if (Array.isArray((data as any).links) && (data as any).links.length) {
      const links = (data as any).links as any[];
      for (const l of links) {
        const fromX = Number(l.fromX);
        const fromY = Number(l.fromY);
        const toX = Number(l.toX);
        const toY = Number(l.toY);
        if (!Number.isFinite(fromX) || !Number.isFinite(fromY) || !Number.isFinite(toX) || !Number.isFinite(toY)) continue;
        const created = this.linkRepository.create({ talentTree: saved, fromX, fromY, toX, toY } as any);
        await this.linkRepository.save(created);
      }
    }
    return this.findOne(saved.id) as Promise<TalentTree>;
  }

  async update(id: number, data: Partial<TalentTree>): Promise<TalentTree | null> {
    const existing = await this.treeRepository.findOne({ where: { id }, relations: { entries: true } as any });
    if (!existing) return null;
    if (data.name !== undefined) existing.name = String(data.name ?? '').trim();
    if (data.file !== undefined) existing.file = data.file as any;
    await this.treeRepository.save(existing);

    if (Array.isArray((data as any).entries)) {
      // replace entries: delete old and insert new
      await this.entryRepository.delete({ talentTreeId: id } as any);
      const entries = (data as any).entries as any[];
      for (const e of entries) {
        const tid = Number(e.talentId);
        if (!Number.isFinite(tid)) continue;
        const talent = await this.talentRepository.findOneBy({ id: tid } as any);
        if (!talent) continue;
        const ent = this.entryRepository.create({ talentTree: existing, talent, posX: Number(e.posX) || 0, posY: Number(e.posY) || 0, order: Number(e.order) || 0 } as any);
        await this.entryRepository.save(ent);
      }
    }

    if (Array.isArray((data as any).links)) {
      // replace links for this tree
      await this.linkRepository.delete({ talentTreeId: id } as any);
      const links = (data as any).links as any[];
      for (const l of links) {
        const fromX = Number(l.fromX);
        const fromY = Number(l.fromY);
        const toX = Number(l.toX);
        const toY = Number(l.toY);
        if (!Number.isFinite(fromX) || !Number.isFinite(fromY) || !Number.isFinite(toX) || !Number.isFinite(toY)) continue;
        const created = this.linkRepository.create({ talentTree: existing, fromX, fromY, toX, toY } as any);
        await this.linkRepository.save(created);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.treeRepository.delete(id);
  }
}
