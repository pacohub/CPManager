import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Sound } from '../Entities/sound.entity';
import { SoundType } from '../Entities/soundType.entity';

@Injectable()
export class SoundService {
	constructor(
		@InjectRepository(Sound)
		private soundRepository: Repository<Sound>,
		@InjectRepository(SoundType)
		private soundTypeRepository: Repository<SoundType>,
	) {}

	async findAll(): Promise<Sound[]> {
		return this.soundRepository
			.createQueryBuilder('s')
			.leftJoinAndSelect('s.types', 't')
			.orderBy('LOWER(s.name)', 'ASC')
			.addOrderBy('s.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Sound | null> {
		return this.soundRepository.findOne({ where: { id }, relations: { types: true } });
	}

	private normalize(data: Partial<Sound>) {
		if (typeof data.name === 'string') data.name = data.name.trim();
		if (typeof (data as any).file === 'string') (data as any).file = (data as any).file.trim();
	}

	private async resolveTypes(typeIds?: any): Promise<SoundType[]> {
		if (typeIds === undefined || typeIds === null) return [];
		if (!Array.isArray(typeIds)) throw new BadRequestException('typeIds debe ser un array de ids');
		const ids = typeIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
		if (ids.length === 0) return [];
		return this.soundTypeRepository.find({ where: { id: In(ids) } });
	}

	async create(data: Partial<Sound> & { typeIds?: any }): Promise<Sound> {
		this.normalize(data);
		if (!data.name) throw new BadRequestException('name es requerido');
		const types = await this.resolveTypes((data as any).typeIds);
		if (!types.length) throw new BadRequestException('Debe seleccionar al menos un tipo');
		const entity = this.soundRepository.create({ ...data, types });
		return this.soundRepository.save(entity);
	}

	async update(id: number, data: Partial<Sound> & { typeIds?: any }): Promise<Sound | null> {
		this.normalize(data);
		const existing = await this.findOne(id);
		if (!existing) throw new NotFoundException('Sound no encontrado');

		let types = existing.types;
		if ((data as any).typeIds !== undefined) {
			types = await this.resolveTypes((data as any).typeIds);
		}
		if (!types.length) throw new BadRequestException('Debe seleccionar al menos un tipo');

		await this.soundRepository.save({ ...existing, ...data, types });
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.soundRepository.delete(id);
	}
}
