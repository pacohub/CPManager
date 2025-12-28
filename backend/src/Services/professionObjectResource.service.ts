import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfessionObjectResource } from '../Entities/professionObjectResource.entity';
import { Profession } from '../Entities/profession.entity';

export type ProfessionObjectResourceInput = {
	resourceId: number;
	quantity?: number;
};

function toInt(value: any, fallback: number): number {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.trunc(n);
}

@Injectable()
export class ProfessionObjectResourceService {
	constructor(
		@InjectRepository(ProfessionObjectResource)
		private professionObjectResourceRepository: Repository<ProfessionObjectResource>,
		@InjectRepository(Profession)
		private professionRepository: Repository<Profession>,
	) {}

	async findForObject(professionId: number, objectId: number): Promise<ProfessionObjectResource[]> {
		return this.professionObjectResourceRepository
			.createQueryBuilder('por')
			.where('por.professionId = :professionId', { professionId })
			.andWhere('por.objectId = :objectId', { objectId })
			.orderBy('por.resourceId', 'ASC')
			.addOrderBy('por.id', 'ASC')
			.getMany();
	}

	async findByProfession(professionId: number): Promise<ProfessionObjectResource[]> {
		return this.professionObjectResourceRepository
			.createQueryBuilder('por')
			.where('por.professionId = :professionId', { professionId })
			.orderBy('por.objectId', 'ASC')
			.addOrderBy('por.resourceId', 'ASC')
			.addOrderBy('por.id', 'ASC')
			.getMany();
	}

	async replaceForObject(
		professionId: number,
		objectId: number,
		links: ProfessionObjectResourceInput[],
	): Promise<ProfessionObjectResource[]> {
		const cleaned = (links ?? [])
			.filter((l) => l && Number.isFinite(Number(l.resourceId)))
			.map((l) => ({
				resourceId: Number(l.resourceId),
				quantity: Math.max(0, toInt(l.quantity, 1)),
			}));

		if (cleaned.length > 200) {
			throw new BadRequestException('Máximo 200 recursos por objeto asociado');
		}

		// Ensure profession exists
		const profession = await this.professionRepository.findOneBy({ id: professionId });
		if (!profession) throw new NotFoundException('Profesión no encontrada');

		// De-duplicate by resourceId keeping last occurrence
		const byResourceId = new Map<number, { resourceId: number; quantity: number }>();
		for (const l of cleaned) byResourceId.set(l.resourceId, l);
		const deduped = Array.from(byResourceId.values());

		await this.professionObjectResourceRepository.delete({ professionId, objectId });
		if (deduped.length === 0) return [];

		await this.professionObjectResourceRepository.save(
			deduped.map((l) => ({
				professionId,
				objectId,
				resourceId: l.resourceId,
				quantity: l.quantity,
			})) as Array<Partial<ProfessionObjectResource>>,
		);

		return this.findForObject(professionId, objectId);
	}
}
