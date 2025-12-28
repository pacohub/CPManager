import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../Entities/campaign.entity';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
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
    return this.campaignRepository.save(campaign);
  }

  async update(id: number, data: Partial<Campaign>): Promise<Campaign | null> {
    await this.campaignRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.campaignRepository.delete(id);
  }
}
