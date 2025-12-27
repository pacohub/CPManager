import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faction } from '../Entities/faction.entity';

@Injectable()
export class FactionService {
	constructor(
		@InjectRepository(Faction)
		private factionRepository: Repository<Faction>,
	) {}

	async findAll(): Promise<Faction[]> {
		return this.factionRepository
			.createQueryBuilder('faction')
			.orderBy('LOWER(faction.name)', 'ASC')
			.addOrderBy('faction.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Faction | null> {
		return this.factionRepository.findOneBy({ id });
	}

	async create(data: Partial<Faction>): Promise<Faction> {
		if (typeof data.name === 'string') data.name = data.name.trim();
		if (typeof data.description === 'string') data.description = data.description.trim();
		if (typeof data.file === 'string') data.file = data.file.trim();
		const faction = this.factionRepository.create(data);
		return this.factionRepository.save(faction);
	}

	async update(id: number, data: Partial<Faction>): Promise<Faction | null> {
		if (typeof data.name === 'string') data.name = data.name.trim();
		if (typeof data.description === 'string') data.description = data.description.trim();
		if (typeof data.file === 'string') data.file = data.file.trim();
		await this.factionRepository.update(id, data);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.factionRepository.delete(id);
	}
}
