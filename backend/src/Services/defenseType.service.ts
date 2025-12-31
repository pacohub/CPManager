import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefenseType } from '../Entities/defenseType.entity';

@Injectable()
export class DefenseTypeService {
	constructor(
		@InjectRepository(DefenseType)
		private defenseTypeRepository: Repository<DefenseType>,
	) {}

	private normalize(data: Partial<DefenseType>) {
		if (typeof data.name === 'string') data.name = data.name.trim();
	}

	async findAll(): Promise<DefenseType[]> {
		return this.defenseTypeRepository
			.createQueryBuilder('dt')
			.orderBy('LOWER(dt.name)', 'ASC')
			.addOrderBy('dt.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<DefenseType | null> {
		return this.defenseTypeRepository.findOneBy({ id });
	}

	async create(data: Partial<DefenseType>): Promise<DefenseType> {
		this.normalize(data);
		if (!String(data?.name ?? '').trim()) throw new BadRequestException('name es requerido');
		const entity = this.defenseTypeRepository.create({ name: String(data.name).trim() });
		return this.defenseTypeRepository.save(entity);
	}

	async update(id: number, data: Partial<DefenseType>): Promise<DefenseType | null> {
		this.normalize(data);
		const existing = await this.findOne(id);
		if (!existing) throw new NotFoundException('Tipo de defensa no encontrado');
		if (data?.name !== undefined) {
			if (!String(data.name ?? '').trim()) throw new BadRequestException('name es requerido');
			existing.name = String(data.name).trim();
		}
		await this.defenseTypeRepository.save(existing);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.defenseTypeRepository.delete(id);
	}
}
