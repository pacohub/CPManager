import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Faction } from '../Entities/faction.entity';
import { Profession } from '../Entities/profession.entity';

@Injectable()
export class FactionService {
	constructor(
		@InjectRepository(Faction)
		private factionRepository: Repository<Faction>,
		@InjectRepository(Profession)
		private professionRepository: Repository<Profession>,
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

	async getProfessions(id: number): Promise<Profession[]> {
		const faction = await this.factionRepository.findOne({
			where: { id },
			relations: { professions: true },
		});
		if (!faction) throw new NotFoundException('Faction no encontrada');
		return faction.professions ?? [];
	}

	async setProfessionIds(id: number, professionIds: number[]): Promise<Faction> {
		const faction = await this.factionRepository.findOne({
			where: { id },
			relations: { professions: true },
		});
		if (!faction) throw new NotFoundException('Faction no encontrada');

		const uniqueIds = Array.from(
			new Set((professionIds ?? []).map((x) => Number(x)).filter((x) => Number.isFinite(x))),
		);

		const professions = uniqueIds.length
			? await this.professionRepository.findBy({ id: In(uniqueIds) })
			: [];

		faction.professions = professions;
		return this.factionRepository.save(faction);
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
