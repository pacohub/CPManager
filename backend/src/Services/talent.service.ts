import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Talent } from '../Entities/talent.entity';

@Injectable()
export class TalentService {
  constructor(
    @InjectRepository(Talent)
    private talentRepository: Repository<Talent>,
  ) {}

  async findAll(): Promise<Talent[]> {
    return this.talentRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.skills', 's')
      .leftJoinAndSelect('t.visuals', 'v')
      .orderBy('LOWER(t.name)', 'ASC')
      .addOrderBy('t.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Talent | null> {
    return this.talentRepository.findOne({ where: { id }, relations: { skills: true, visuals: true, treeEntries: true } });
  }

  async create(data: Partial<Talent>): Promise<Talent> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    const t = this.talentRepository.create(data as any);
    const saved = await this.talentRepository.save(t);
    return (saved as unknown) as Talent;
  }

  async update(id: number, data: Partial<Talent>): Promise<Talent | null> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    await this.talentRepository.update(id, data as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.talentRepository.delete(id);
  }
}
