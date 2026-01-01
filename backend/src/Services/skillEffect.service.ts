import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillEffect } from '../Entities/skillEffect.entity';

@Injectable()
export class SkillEffectService {
  constructor(
    @InjectRepository(SkillEffect)
    private skillEffectRepository: Repository<SkillEffect>,
  ) {}

  async findAll(): Promise<SkillEffect[]> {
    return this.skillEffectRepository
      .createQueryBuilder('skillEffect')
      .leftJoinAndSelect('skillEffect.skill', 'skill')
      .leftJoinAndSelect('skillEffect.effect', 'effect')
      .orderBy('skillEffect.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<SkillEffect | null> {
    return this.skillEffectRepository.findOne({ where: { id }, relations: ['skill', 'effect'] });
  }

  async create(data: Partial<SkillEffect>): Promise<SkillEffect> {
    const s = this.skillEffectRepository.create(data);
    return this.skillEffectRepository.save(s);
  }

  async update(id: number, data: Partial<SkillEffect>): Promise<SkillEffect | null> {
    await this.skillEffectRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.skillEffectRepository.delete(id);
  }
}
