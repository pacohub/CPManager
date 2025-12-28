import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Chapter, ChapterSpecialType } from '../Entities/chapter.entity';
import { Campaign } from '../Entities/campaign.entity';
import { Resource } from '../Entities/resource.entity';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
  ) {}

  async findAll(): Promise<Chapter[]> {
    return this.chapterRepository.find({ order: { id: 'ASC' } });
  }

  private async findDuplicateByName(campaignId: number, name: string, excludeId?: number): Promise<Chapter | null> {
    const normalized = (name ?? '').trim().toLowerCase();
    if (!normalized) return null;

    const qb = this.chapterRepository
      .createQueryBuilder('chapter')
      .where('chapter.campaignId = :campaignId', { campaignId })
      .andWhere('TRIM(LOWER(chapter.name)) = :name', { name: normalized });
    if (excludeId !== undefined) {
      qb.andWhere('chapter.id != :excludeId', { excludeId });
    }
    return qb.getOne();
  }

  private async assertUniqueName(name: string | undefined, campaignId: number, excludeId?: number): Promise<void> {
    if (name === undefined) return;
    const dup = await this.findDuplicateByName(campaignId, name, excludeId);
    if (!dup) return;
    const campaign = await this.campaignRepository.findOneBy({ id: campaignId });
    const campaignName = campaign?.name ?? String(campaignId);
    throw new BadRequestException(`La campaña ${campaignName} tiene un capítulo con ese nombre`);
  }

  private static readonly CREDITS_NAME = 'Créditos';

  private normalizeName(value: any): string {
    return String(value ?? '').trim();
  }

  private isCreditsName(name: any): boolean {
    const n = this.normalizeName(name).toLowerCase();
    // Accept both with and without accent for safety
    return n === 'créditos' || n === 'creditos';
  }

  private async ensureCreditsChapterForCampaign(campaignId: number): Promise<Chapter> {
    const existing = await this.chapterRepository.find({ where: { campaignId }, order: { order: 'ASC', id: 'ASC' } });

    let credits = existing.find((c) => c.specialType === ChapterSpecialType.CREDITS)
      ?? existing.find((c) => this.isCreditsName(c.name));

    const nonCredits = existing.filter((c) => c.id !== credits?.id);
    const maxNonCreditsOrder = nonCredits.length
      ? Math.max(...nonCredits.map((c) => Number.isFinite(Number(c.order)) ? Number(c.order) : 0))
      : -1;
    const desiredOrder = maxNonCreditsOrder + 1;

    if (!credits) {
      credits = this.chapterRepository.create({
        campaignId,
        name: ChapterService.CREDITS_NAME,
        order: desiredOrder,
        description: '',
        image: '',
        file: '',
        specialType: ChapterSpecialType.CREDITS,
      });
      return this.chapterRepository.save(credits);
    }

    const patch: Partial<Chapter> = {};
    if (credits.specialType !== ChapterSpecialType.CREDITS) patch.specialType = ChapterSpecialType.CREDITS;
    if (credits.name !== ChapterService.CREDITS_NAME) patch.name = ChapterService.CREDITS_NAME;
    if (credits.order !== desiredOrder) patch.order = desiredOrder;

    if (Object.keys(patch).length === 0) return credits;
    await this.chapterRepository.update(credits.id, patch);
    return (await this.findOne(credits.id)) as Chapter;
  }

  async findAllByCampaign(campaignId: number): Promise<Chapter[]> {
    if (!Number.isFinite(campaignId)) return [];
    await this.ensureCreditsChapterForCampaign(campaignId);
    return this.chapterRepository.find({ where: { campaignId }, order: { order: 'ASC', id: 'ASC' } });
  }

  async findOne(id: number): Promise<Chapter | null> {
    return this.chapterRepository.findOneBy({ id });
  }

  async create(data: Partial<Chapter>): Promise<Chapter> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (!Number.isFinite(Number(data.campaignId))) throw new BadRequestException('campaignId es requerido');
    const campaignId = Number(data.campaignId);

    if (this.isCreditsName(data.name) || data.specialType === ChapterSpecialType.CREDITS) {
      throw new BadRequestException('El capítulo Créditos se gestiona automáticamente');
    }

    // Credits always exists and is always last.
    const credits = await this.ensureCreditsChapterForCampaign(campaignId);

    await this.assertUniqueName(data.name, campaignId);

    // Default: insert right before credits.
    let desiredOrder = data.order === undefined ? credits.order : Number(data.order);
    if (!Number.isFinite(desiredOrder) || desiredOrder < 0) desiredOrder = credits.order;
    if (desiredOrder >= credits.order) desiredOrder = credits.order;
    data.order = desiredOrder;

    // Push credits to keep it last.
    await this.chapterRepository.update(credits.id, { order: credits.order + 1 });

    const chapter = this.chapterRepository.create({
      ...data,
      campaignId,
      specialType: null,
    });
    return this.chapterRepository.save(chapter);
  }

  async update(id: number, data: Partial<Chapter>): Promise<Chapter | null> {
    const existing = await this.findOne(id);
    if (!existing) return null;

    if (typeof data.name === 'string') data.name = data.name.trim();

    // Credits is system-managed: keep it immutable (name/order/campaign).
    if (existing.specialType === ChapterSpecialType.CREDITS || this.isCreditsName(existing.name)) {
      delete (data as any).name;
      delete (data as any).order;
      delete (data as any).campaignId;
      delete (data as any).specialType;
    } else {
      const campaignId = existing.campaignId;
      await this.assertUniqueName(data.name, campaignId, id);

      // Never allow renaming to credits.
      if (data.name !== undefined && this.isCreditsName(data.name)) {
        throw new BadRequestException('El capítulo Créditos se gestiona automáticamente');
      }
    }

    await this.chapterRepository.update(id, data);

    // Keep credits last for the campaign.
    if (Number.isFinite(existing.campaignId)) {
      await this.ensureCreditsChapterForCampaign(existing.campaignId);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    if (!existing) return;
    if (existing.specialType === ChapterSpecialType.CREDITS || this.isCreditsName(existing.name)) {
      throw new BadRequestException('No se puede eliminar el capítulo Créditos');
    }
    await this.chapterRepository.delete(id);

    if (Number.isFinite(existing.campaignId)) {
      await this.ensureCreditsChapterForCampaign(existing.campaignId);
    }
  }

  async getResources(chapterId: number): Promise<Resource[]> {
    const chapter = await this.chapterRepository.findOne({ where: { id: chapterId }, relations: { resources: true } });
    return chapter?.resources ?? [];
  }

  async setResourceIds(chapterId: number, resourceIds: number[]): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({ where: { id: chapterId }, relations: { resources: true } });
    if (!chapter) throw new BadRequestException('Capítulo no encontrado');
    const ids = (resourceIds || []).map(Number).filter((n) => Number.isFinite(n));
    const resources = ids.length ? await this.resourceRepository.findBy({ id: In(ids) }) : [];
    chapter.resources = resources;
    return this.chapterRepository.save(chapter);
  }
}
