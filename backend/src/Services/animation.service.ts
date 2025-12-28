import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Animation } from '../Entities/animation.entity';

@Injectable()
export class AnimationService {
	constructor(
		@InjectRepository(Animation)
		private animationRepository: Repository<Animation>,
	) {}

	async findAll(): Promise<Animation[]> {
		return this.animationRepository
			.createQueryBuilder('a')
			.orderBy('LOWER(a.name)', 'ASC')
			.addOrderBy('a.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Animation | null> {
		return this.animationRepository.findOneBy({ id });
	}

	private normalize(data: Partial<Animation>) {
		if (typeof data.name === 'string') data.name = data.name.trim();
	}

	async create(data: Partial<Animation>): Promise<Animation> {
		this.normalize(data);
		if (!data.name) throw new BadRequestException('name es requerido');
		const entity = this.animationRepository.create({ name: data.name });
		return this.animationRepository.save(entity);
	}

	async update(id: number, data: Partial<Animation>): Promise<Animation | null> {
		this.normalize(data);
		if (data.name !== undefined && !String(data.name || '').trim()) {
			throw new BadRequestException('name es requerido');
		}
		await this.animationRepository.update(id, { name: data.name } as any);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.animationRepository.delete(id);
	}
}
