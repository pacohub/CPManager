import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '../Entities/chapter.entity';
import { Campaign } from '../Entities/campaign.entity';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  async findAll(): Promise<Chapter[]> {
    return this.chapterRepository.find({ order: { id: 'ASC' } });
  }

  private async findDuplicateByName(name: string, excludeId?: number): Promise<Chapter | null> {
    const normalized = (name ?? '').trim().toLowerCase();
    if (!normalized) return null;

    const qb = this.chapterRepository
      .createQueryBuilder('chapter')
      .where('TRIM(LOWER(chapter.name)) = :name', { name: normalized });
    if (excludeId !== undefined) {
      qb.andWhere('chapter.id != :excludeId', { excludeId });
    }
    return qb.getOne();
  }

  private async assertUniqueName(name?: string, excludeId?: number): Promise<void> {
    if (name === undefined) return;
    const dup = await this.findDuplicateByName(name, excludeId);
    if (!dup) return;
    const campaign = await this.campaignRepository.findOneBy({ id: dup.campaignId });
    const campaignName = campaign?.name ?? String(dup.campaignId);
    throw new BadRequestException(`La campaña ${campaignName} tiene un capítulo con ese nombre`);
  }

  async findAllByCampaign(campaignId: number): Promise<Chapter[]> {
    return this.chapterRepository.find({ where: { campaignId }, order: { order: 'ASC', id: 'ASC' } });
  }

  async findOne(id: number): Promise<Chapter | null> {
    return this.chapterRepository.findOneBy({ id });
  }

  async create(data: Partial<Chapter>): Promise<Chapter> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    await this.assertUniqueName(data.name);

    if (data.order === undefined && data.campaignId !== undefined) {
      const raw = await this.chapterRepository
        .createQueryBuilder('chapter')
        .select('MAX(chapter.order)', 'max')
        .where('chapter.campaignId = :campaignId', { campaignId: data.campaignId })
        .getRawOne<{ max: string | number | null }>();

      const maxOrder = raw?.max === null || raw?.max === undefined ? -1 : Number(raw.max);
      data.order = Number.isFinite(maxOrder) ? maxOrder + 1 : 0;
    }

    const chapter = this.chapterRepository.create(data);
    return this.chapterRepository.save(chapter);
  }

  async update(id: number, data: Partial<Chapter>): Promise<Chapter | null> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    await this.assertUniqueName(data.name, id);
    await this.chapterRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.chapterRepository.delete(id);
  }
}
