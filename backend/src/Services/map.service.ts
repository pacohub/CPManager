import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Component } from '../Entities/component.entity';
import { Map } from '../Entities/map.entity';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(Map)
    private mapRepository: Repository<Map>,
		@InjectRepository(Component)
		private componentRepository: Repository<Component>,
  ) {}

  async findAll(): Promise<Map[]> {
    return this.mapRepository
      .createQueryBuilder('map')
      .orderBy('LOWER(map.name)', 'ASC')
      .addOrderBy('map.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Map | null> {
    return this.mapRepository.findOneBy({ id });
  }

  async create(data: Partial<Map>): Promise<Map> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (typeof data.description === 'string') data.description = data.description.trim();
    const map = this.mapRepository.create(data);
    return this.mapRepository.save(map);
  }

  async update(id: number, data: Partial<Map>): Promise<Map | null> {
    if (typeof data.name === 'string') data.name = data.name.trim();
    if (typeof data.description === 'string') data.description = data.description.trim();
    await this.mapRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.mapRepository.delete(id);
  }

  async getComponents(mapId: number): Promise<Component[]> {
    const map = await this.mapRepository.findOne({ where: { id: mapId }, relations: { components: true } });
    return map?.components ?? [];
  }

  async setComponentIds(mapId: number, componentIds: number[]): Promise<Map> {
    const map = await this.mapRepository.findOne({ where: { id: mapId }, relations: { components: true } });
    if (!map) throw new Error('Mapa no encontrado');
    const ids = (componentIds || []).map(Number).filter((n) => Number.isFinite(n));
    const components = ids.length ? await this.componentRepository.findBy({ id: In(ids) }) : [];
    map.components = components;
    return this.mapRepository.save(map);
  }
}
