import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profession } from '../Entities/profession.entity';

@Injectable()
export class ProfessionService {
	constructor(
		@InjectRepository(Profession)
		private professionRepository: Repository<Profession>,
	) {}

	private normalizeText(value: any): string | undefined {
		if (value === undefined) return undefined;
		if (value === null) return '';
		return String(value).trim();
	}

	async findAll(): Promise<Profession[]> {
		return this.professionRepository
			.createQueryBuilder('profession')
			.orderBy('LOWER(profession.name)', 'ASC')
			.addOrderBy('profession.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Profession | null> {
		return this.professionRepository.findOneBy({ id });
	}

	async create(data: any): Promise<Profession> {
		const name = this.normalizeText(data?.name);
		if (!name) throw new BadRequestException('name es requerido');

		const profession = this.professionRepository.create({
			name,
			description: this.normalizeText(data?.description) ?? '',
			link: this.normalizeText(data?.link) ?? '',
		});

		return this.professionRepository.save(profession);
	}

	async update(id: number, data: any): Promise<Profession | null> {
		const patch: Partial<Profession> = {};

		if (data?.name !== undefined) {
			const name = this.normalizeText(data?.name);
			if (!name) throw new BadRequestException('name es requerido');
			patch.name = name;
		}
		if (data?.description !== undefined) patch.description = this.normalizeText(data?.description) ?? '';
		if (data?.link !== undefined) patch.link = this.normalizeText(data?.link) ?? '';

		await this.professionRepository.update(id, patch);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.professionRepository.delete(id);
	}
}
