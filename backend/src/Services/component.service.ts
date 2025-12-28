import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { COMPONENT_TYPES, Component } from '../Entities/component.entity';

@Injectable()
export class ComponentService {
	constructor(
		@InjectRepository(Component)
		private componentRepository: Repository<Component>,
	) {}

	async findAll(): Promise<Component[]> {
		return this.componentRepository
			.createQueryBuilder('c')
			.orderBy('LOWER(c.name)', 'ASC')
			.addOrderBy('c.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Component | null> {
		return this.componentRepository.findOneBy({ id });
	}

	private normalize(data: Partial<Component>) {
		if (typeof data.name === 'string') data.name = data.name.trim();
		if (typeof data.description === 'string') data.description = data.description.trim();
		if (typeof data.model === 'string') data.model = data.model.trim();
		if (typeof data.type === 'string') data.type = data.type.trim();
	}

	private validateType(type?: any) {
		if (type === undefined || type === null) return;
		if (typeof type !== 'string') throw new BadRequestException('type debe ser string');
		if (!COMPONENT_TYPES.includes(type as any)) {
			throw new BadRequestException(`type inválido. Debe ser uno de: ${COMPONENT_TYPES.join(', ')}`);
		}
	}

	async create(data: Partial<Component>): Promise<Component> {
		this.normalize(data);
		this.validateType((data as any).type);
		const entity = this.componentRepository.create(data);
		return this.componentRepository.save(entity);
	}

	async update(id: number, data: Partial<Component>): Promise<Component | null> {
		this.normalize(data);
		this.validateType((data as any).type);
		await this.componentRepository.update(id, data);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.componentRepository.delete(id);
	}
}
