import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceType } from '../Entities/resourceType.entity';

@Injectable()
export class ResourceTypeService {
	constructor(
		@InjectRepository(ResourceType)
		private resourceTypeRepository: Repository<ResourceType>,
	) {}

	async findAll(): Promise<ResourceType[]> {
		return this.resourceTypeRepository
			.createQueryBuilder('rt')
			.orderBy('LOWER(rt.name)', 'ASC')
			.addOrderBy('rt.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<ResourceType | null> {
		return this.resourceTypeRepository.findOneBy({ id });
	}

	private normalize(data: Partial<ResourceType>) {
		if (typeof data.name === 'string') data.name = data.name.trim();
	}

	async create(data: Partial<ResourceType>): Promise<ResourceType> {
		this.normalize(data);
		if (!String(data?.name ?? '').trim()) throw new BadRequestException('name es requerido');
		const entity = this.resourceTypeRepository.create(data);
		return this.resourceTypeRepository.save(entity);
	}

	async update(id: number, data: Partial<ResourceType>): Promise<ResourceType | null> {
		this.normalize(data);
		await this.resourceTypeRepository.update(id, data);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.resourceTypeRepository.delete(id);
	}
}
