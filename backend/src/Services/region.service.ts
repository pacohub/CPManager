import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../Entities/region.entity';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
  ) {}

  async findAll(): Promise<Region[]> {
    return this.regionRepository
      .createQueryBuilder('region')
      .orderBy('LOWER(region.name)', 'ASC')
      .addOrderBy('region.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Region | null> {
    return this.regionRepository.findOneBy({ id });
  }

  async create(data: Partial<Region>): Promise<Region> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (typeof data.description === 'string') data.description = data.description.trim();
    if (typeof data.link === 'string') data.link = data.link.trim();
    const region = this.regionRepository.create(data);
    return this.regionRepository.save(region);
  }

  async update(id: number, data: Partial<Region>): Promise<Region | null> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (typeof data.description === 'string') data.description = data.description.trim();
    if (typeof data.link === 'string') data.link = data.link.trim();
    await this.regionRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.regionRepository.delete(id);
  }
}
