import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../Entities/resource.entity';
import { ResourceType } from '../Entities/resourceType.entity';

@Injectable()
export class ResourceService {
	constructor(
		@InjectRepository(Resource)
		private resourceRepository: Repository<Resource>,
		@InjectRepository(ResourceType)
		private resourceTypeRepository: Repository<ResourceType>,
	) {}

	async findAll(): Promise<Resource[]> {
		return this.resourceRepository
			.createQueryBuilder('r')
			.leftJoinAndSelect('r.resourceType', 'resourceType')
			.orderBy('LOWER(r.name)', 'ASC')
			.addOrderBy('r.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Resource | null> {
		return this.resourceRepository.findOne({ where: { id }, relations: { resourceType: true } as any });
	}

	private normalizeText(value: any): string {
		return String(value ?? '').trim();
	}

	async create(data: any): Promise<Resource> {
		const name = this.normalizeText(data?.name);
		if (!name) throw new BadRequestException('name es requerido');
		const description = this.normalizeText(data?.description);
		const icon = this.normalizeText(data?.icon);
		const fileLink = this.normalizeText(data?.fileLink);
		const resourceTypeId = Number(data?.resourceTypeId ?? data?.resourceType?.id);
		if (!Number.isFinite(resourceTypeId)) throw new BadRequestException('resourceTypeId es requerido');
		const resourceType = await this.resourceTypeRepository.findOneBy({ id: resourceTypeId });
		if (!resourceType) throw new NotFoundException('Tipo de recurso no encontrado');

		const entity = this.resourceRepository.create({
			name,
			description: description || '',
			icon: icon || '',
			fileLink: fileLink || '',
			resourceType,
		});
		return this.resourceRepository.save(entity);
	}

	async update(id: number, data: any): Promise<Resource | null> {
		const existing = await this.resourceRepository.findOne({ where: { id }, relations: { resourceType: true } as any });
		if (!existing) throw new NotFoundException('Recurso no encontrado');

		if (data?.name !== undefined) {
			const name = this.normalizeText(data?.name);
			if (!name) throw new BadRequestException('name es requerido');
			existing.name = name;
		}
		if (data?.description !== undefined) existing.description = this.normalizeText(data?.description) || '';
		if (data?.icon !== undefined) existing.icon = this.normalizeText(data?.icon) || '';
		if (data?.fileLink !== undefined) existing.fileLink = this.normalizeText(data?.fileLink) || '';

		if (data?.resourceTypeId !== undefined || data?.resourceType?.id !== undefined) {
			const resourceTypeId = Number(data?.resourceTypeId ?? data?.resourceType?.id);
			if (!Number.isFinite(resourceTypeId)) throw new BadRequestException('resourceTypeId inválido');
			const resourceType = await this.resourceTypeRepository.findOneBy({ id: resourceTypeId });
			if (!resourceType) throw new NotFoundException('Tipo de recurso no encontrado');
			existing.resourceType = resourceType;
		}

		await this.resourceRepository.save(existing);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.resourceRepository.delete(id);
	}
}
