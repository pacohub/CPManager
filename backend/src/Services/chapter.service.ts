import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '../Entities/chapter.entity';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
  ) {}

  async findAllByCampaign(campaignId: number): Promise<Chapter[]> {
    return this.chapterRepository.find({ where: { campaignId }, order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Chapter | null> {
    return this.chapterRepository.findOneBy({ id });
  }

  async create(data: Partial<Chapter>): Promise<Chapter> {
    const chapter = this.chapterRepository.create(data);
    return this.chapterRepository.save(chapter);
  }

  async update(id: number, data: Partial<Chapter>): Promise<Chapter | null> {
    await this.chapterRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.chapterRepository.delete(id);
  }
}
