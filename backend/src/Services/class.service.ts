import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Animation } from '../Entities/animation.entity';
import { Class } from '../Entities/class.entity';

@Injectable()
export class ClassService {
	constructor(
		@InjectRepository(Class)
		private classRepository: Repository<Class>,
		@InjectRepository(Animation)
		private animationRepository: Repository<Animation>,
	) {}

	private coerceIdArray(value: any): number[] {
		if (!Array.isArray(value)) return [];
		const out: number[] = [];
		const seen = new Set<number>();
		for (const raw of value) {
			const n = Number.parseInt(String(raw), 10);
			if (!Number.isFinite(n) || n <= 0) continue;
			if (seen.has(n)) continue;
			seen.add(n);
			out.push(n);
		}
		return out;
	}

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
			.leftJoinAndSelect('c.animations', 'a')
			.orderBy('LOWER(c.name)', 'ASC')
			.addOrderBy('c.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Class | null> {
		return this.classRepository.findOne({ where: { id }, relations: { animations: true } });
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
		const existing = await this.classRepository.findOne({ where: { id }, relations: { animations: true } });
		if (!existing) return null;

		const patch: Partial<Class> = {};
		if (data?.name !== undefined) patch.name = this.normalizeText(data?.name) ?? '';
		if (data?.icon !== undefined) patch.icon = this.normalizeText(data?.icon) ?? '';
		if (data?.description !== undefined) patch.description = this.normalizeText(data?.description) ?? '';
		if (data?.level !== undefined) patch.level = this.normalizeLevel(data?.level);

		if (patch.name !== undefined && !String(patch.name).trim()) {
			throw new BadRequestException('name es requerido');
		}

		Object.assign(existing, patch);

		if (data?.animationIds !== undefined) {
			const ids = this.coerceIdArray(data.animationIds);
			existing.animations = ids.length ? await this.animationRepository.find({ where: { id: In(ids) } }) : [];
		}

		await this.classRepository.save(existing);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.classRepository.delete(id);
	}
}
