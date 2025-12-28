import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SoundType } from '../Entities/soundType.entity';

@Injectable()
export class SoundTypeService {
	constructor(
		@InjectRepository(SoundType)
		private soundTypeRepository: Repository<SoundType>,
	) {}

	async findAll(): Promise<SoundType[]> {
		return this.soundTypeRepository
			.createQueryBuilder('t')
			.orderBy('LOWER(t.name)', 'ASC')
			.addOrderBy('t.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<SoundType | null> {
		return this.soundTypeRepository.findOneBy({ id });
	}

	private normalize(data: Partial<SoundType>) {
		if (typeof data.name === 'string') data.name = data.name.trim();
	}

	async create(data: Partial<SoundType>): Promise<SoundType> {
		this.normalize(data);
		if (!data.name) throw new BadRequestException('name es requerido');
		const entity = this.soundTypeRepository.create(data);
		return this.soundTypeRepository.save(entity);
	}

	async update(id: number, data: Partial<SoundType>): Promise<SoundType | null> {
		this.normalize(data);
		await this.soundTypeRepository.update(id, data);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.soundTypeRepository.delete(id);
	}
}
