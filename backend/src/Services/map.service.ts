import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Map } from '../Entities/map.entity';
import { Region } from '../Entities/region.entity';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(Map)
    private mapRepository: Repository<Map>,

    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
  ) {}

  private async resolveRegions(regionIds: unknown): Promise<Region[] | undefined> {
    if (regionIds === undefined) return undefined;

    let ids: number[] = [];
    if (Array.isArray(regionIds)) {
      ids = regionIds.map((v) => Number(v)).filter((n) => Number.isFinite(n));
    } else if (typeof regionIds === 'string') {
      const trimmed = regionIds.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          ids = parsed.map((v) => Number(v)).filter((n) => Number.isFinite(n));
        } else {
          ids = trimmed
            .split(',')
            .map((s) => Number(s.trim()))
            .filter((n) => Number.isFinite(n));
        }
      } catch {
        ids = trimmed
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isFinite(n));
      }
    } else {
      const n = Number(regionIds);
      ids = Number.isFinite(n) ? [n] : [];
    }

    if (ids.length === 0) return [];
    return this.regionRepository.findByIds(ids as any);
  }

  async findAll(): Promise<Map[]> {
    return this.mapRepository
      .createQueryBuilder('map')
      .leftJoinAndSelect('map.regions', 'region')
      .orderBy('LOWER(map.name)', 'ASC')
      .addOrderBy('map.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Map | null> {
    return this.mapRepository.findOne({
      where: { id },
      relations: ['regions'],
    });
  }

  async create(data: Partial<Map>): Promise<Map> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (typeof data.description === 'string') data.description = data.description.trim();
    if (typeof data.file === 'string') data.file = data.file.trim();

    const regions = await this.resolveRegions((data as any).regionIds);
    const map = this.mapRepository.create(data);
    if (regions !== undefined) map.regions = regions;
    return this.mapRepository.save(map);
  }

  async update(id: number, data: Partial<Map>): Promise<Map | null> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (typeof data.description === 'string') data.description = data.description.trim();
    if (typeof data.file === 'string') data.file = data.file.trim();

    const regions = await this.resolveRegions((data as any).regionIds);
    if (regions !== undefined) {
      const map = await this.findOne(id);
      if (!map) return null;
      Object.assign(map, data);
      map.regions = regions;
      await this.mapRepository.save(map);
      return this.findOne(id);
    }

    await this.mapRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.mapRepository.delete(id);
  }
}
