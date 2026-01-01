import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisualEffect } from '../Entities/visualEffect.entity';

@Injectable()
export class VisualEffectService {
  constructor(
    @InjectRepository(VisualEffect)
    private visualEffectRepository: Repository<VisualEffect>,
  ) {}

  async findAll(): Promise<VisualEffect[]> {
    return this.visualEffectRepository
      .createQueryBuilder('visualEffect')
      .orderBy('LOWER(visualEffect.name)', 'ASC')
      .addOrderBy('visualEffect.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<VisualEffect | null> {
    return this.visualEffectRepository.findOneBy({ id });
  }

  async create(data: Partial<VisualEffect>): Promise<VisualEffect> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    const v = this.visualEffectRepository.create(data);
    return this.visualEffectRepository.save(v);
  }

  async update(id: number, data: Partial<VisualEffect>): Promise<VisualEffect | null> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    await this.visualEffectRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.visualEffectRepository.delete(id);
  }
}
