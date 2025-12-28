import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../Entities/class.entity';

@Injectable()
export class ClassService {
	constructor(
		@InjectRepository(Class)
		private classRepository: Repository<Class>,
	) {}

	private normalizeText(value: any): string | undefined {
		if (value === undefined) return undefined;
		if (value === null) return '';
		return String(value).trim();
	}

	private normalizeLevel(value: any): number {
		const n = Number.parseInt(String(value), 10);
		if (!Number.isFinite(n)) return 1;
		return Math.max(1, n);
	}

	async findAll(): Promise<Class[]> {
		return this.classRepository
			.createQueryBuilder('c')
			.orderBy('LOWER(c.name)', 'ASC')
			.addOrderBy('c.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Class | null> {
		return this.classRepository.findOneBy({ id });
	}

	async create(data: any): Promise<Class> {
		const name = this.normalizeText(data?.name);
		if (!name) throw new BadRequestException('name es requerido');

		const item = this.classRepository.create({
			name,
			icon: this.normalizeText(data?.icon) ?? '',
			description: this.normalizeText(data?.description) ?? '',
			level: this.normalizeLevel(data?.level),
		});

		return this.classRepository.save(item);
	}

	async update(id: number, data: any): Promise<Class | null> {
		const patch: Partial<Class> = {};
		if (data?.name !== undefined) patch.name = this.normalizeText(data?.name) ?? '';
		if (data?.icon !== undefined) patch.icon = this.normalizeText(data?.icon) ?? '';
		if (data?.description !== undefined) patch.description = this.normalizeText(data?.description) ?? '';
		if (data?.level !== undefined) patch.level = this.normalizeLevel(data?.level);

		if (patch.name !== undefined && !String(patch.name).trim()) {
			throw new BadRequestException('name es requerido');
		}

		await this.classRepository.update(id, patch);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.classRepository.delete(id);
	}
}
