import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
		if (!Number.isFinite(id) || id <= 0) throw new BadRequestException('id inválido');

		// Ensure the resource exists and detach any join-table relations before deleting.
		try {
			await this.resourceRepository.manager.transaction(async (manager) => {
				const repo = manager.getRepository(Resource);
				const existing = await repo.findOne({ where: { id }, relations: { chapters: true } as any });
				if (!existing) throw new NotFoundException('Recurso no encontrado');

				const chapterIds = (existing.chapters ?? [])
					.map((c: any) => Number(c?.id))
					.filter((n: number) => Number.isFinite(n) && n > 0);
				if (chapterIds.length) {
					await manager
						.createQueryBuilder()
						.relation(Resource, 'chapters')
						.of(id)
						.remove(chapterIds);
				}

				await repo.delete(id);
			});
		} catch (err: any) {
			// SQLite FK errors surface as SQLITE_CONSTRAINT / FOREIGN KEY constraint failed
			const message = String(err?.message ?? '');
			if (message.includes('FOREIGN KEY constraint failed') || message.includes('SQLITE_CONSTRAINT')) {
				throw new ConflictException('No se puede eliminar el recurso porque está en uso');
			}
			throw err;
		}
	}
}
