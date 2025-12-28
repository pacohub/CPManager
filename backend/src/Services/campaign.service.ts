import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../Entities/campaign.entity';
import { Chapter, ChapterSpecialType } from '../Entities/chapter.entity';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
		@InjectRepository(Chapter)
		private chapterRepository: Repository<Chapter>,
  ) {}

  async findAllBySaga(sagaId?: number): Promise<Campaign[]> {
    if (Number.isFinite(sagaId)) {
      return this.campaignRepository.find({ where: { sagaId: sagaId as number }, order: { order: 'ASC' } });
    }
    return this.campaignRepository
      .createQueryBuilder('campaign')
      .orderBy('campaign.sagaId', 'ASC')
      .addOrderBy('campaign.order', 'ASC')
      .addOrderBy('LOWER(campaign.name)', 'ASC')
      .addOrderBy('campaign.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Campaign | null> {
    return this.campaignRepository.findOneBy({ id });
  }

  async create(data: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaignRepository.create(data);
    const saved = await this.campaignRepository.save(campaign);

    // Ensure every campaign has a system Credits chapter.
    const credits = this.chapterRepository.create({
      campaignId: saved.id,
      name: 'Créditos',
      order: 0,
      description: '',
      image: '',
      file: '',
      specialType: ChapterSpecialType.CREDITS,
    });
    await this.chapterRepository.save(credits);

    return saved;
  }

  async update(id: number, data: Partial<Campaign>): Promise<Campaign | null> {
    await this.campaignRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.campaignRepository.delete(id);
  }
}
