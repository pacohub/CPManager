import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Effect } from '../Entities/effect.entity';

@Injectable()
export class EffectService {
  constructor(
    @InjectRepository(Effect)
    private effectRepository: Repository<Effect>,
  ) {}

  async findAll(): Promise<Effect[]> {
    return this.effectRepository
      .createQueryBuilder('effect')
      .orderBy('LOWER(effect.name)', 'ASC')
      .addOrderBy('effect.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Effect | null> {
    return this.effectRepository.findOneBy({ id });
  }

  async create(data: Partial<Effect>): Promise<Effect> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (typeof data.description === 'string') data.description = data.description.trim();
    const e = this.effectRepository.create(data);
    return this.effectRepository.save(e);
  }

  async update(id: number, data: Partial<Effect>): Promise<Effect | null> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (typeof data.description === 'string') data.description = data.description.trim();
    await this.effectRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.effectRepository.delete(id);
  }
}
