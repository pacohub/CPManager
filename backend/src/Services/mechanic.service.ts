import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mechanic } from '../Entities/mechanic.entity';

@Injectable()
export class MechanicService {
	constructor(
		@InjectRepository(Mechanic)
		private mechanicRepository: Repository<Mechanic>,
	) {}

	private normalizeText(value: any): string | undefined {
		if (value === undefined) return undefined;
		if (value === null) return '';
		return String(value).trim();
	}

	async findAll(): Promise<Mechanic[]> {
		return this.mechanicRepository
			.createQueryBuilder('mechanic')
			.orderBy('LOWER(mechanic.name)', 'ASC')
			.addOrderBy('mechanic.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Mechanic | null> {
		return this.mechanicRepository.findOneBy({ id });
	}

	async create(data: any): Promise<Mechanic> {
		const name = this.normalizeText(data?.name);
		if (!name) throw new BadRequestException('name es requerido');

		const mechanic = this.mechanicRepository.create({
			name,
			description: this.normalizeText(data?.description) ?? '',
		});

		return this.mechanicRepository.save(mechanic);
	}

	async update(id: number, data: any): Promise<Mechanic | null> {
		const patch: Partial<Mechanic> = {};

		if (data?.name !== undefined) {
			const name = this.normalizeText(data?.name);
			if (!name) throw new BadRequestException('name es requerido');
			patch.name = name;
		}
		if (data?.description !== undefined) patch.description = this.normalizeText(data?.description) ?? '';

		await this.mechanicRepository.update(id, patch);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.mechanicRepository.delete(id);
	}
}
