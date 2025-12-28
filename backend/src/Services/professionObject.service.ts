import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfessionObject } from '../Entities/professionObject.entity';
import { Profession } from '../Entities/profession.entity';

export type ProfessionObjectInput = {
	objectId: number;
	level?: number;
	quantity?: number;
	timeSeconds?: number;
};

function toInt(value: any, fallback: number): number {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.trunc(n);
}

@Injectable()
export class ProfessionObjectService {
	constructor(
		@InjectRepository(ProfessionObject)
		private professionObjectRepository: Repository<ProfessionObject>,
		@InjectRepository(Profession)
		private professionRepository: Repository<Profession>,
	) {}

	async findByProfession(professionId: number): Promise<ProfessionObject[]> {
		return this.professionObjectRepository
			.createQueryBuilder('po')
			.where('po.professionId = :professionId', { professionId })
			.orderBy('po.objectId', 'ASC')
			.addOrderBy('po.id', 'ASC')
			.getMany();
	}

	async replaceForProfession(professionId: number, links: ProfessionObjectInput[]): Promise<ProfessionObject[]> {
		const cleaned = (links ?? [])
			.filter((l) => l && Number.isFinite(Number(l.objectId)))
			.map((l) => {
				const level = Math.max(1, toInt(l.level, 1));
				const quantity = Math.max(0, toInt(l.quantity, 1));
				const timeSeconds = Math.max(0, toInt(l.timeSeconds, 0));
				return {
					objectId: Number(l.objectId),
					level,
					quantity,
					timeSeconds,
				};
			});

		if (cleaned.length > 200) {
			throw new BadRequestException('Máximo 200 objetos por profesión');
		}

		// Ensure profession exists (avoid orphan links)
		const profession = await this.professionRepository.findOneBy({ id: professionId });
		if (!profession) throw new NotFoundException('Profesión no encontrada');

		// De-duplicate by objectId keeping the last occurrence
		const byObjectId = new Map<number, { objectId: number; level: number; quantity: number; timeSeconds: number }>();
		for (const l of cleaned) byObjectId.set(l.objectId, l);
		const deduped = Array.from(byObjectId.values());

		await this.professionObjectRepository.delete({ professionId });
		if (deduped.length === 0) return [];

		await this.professionObjectRepository.save(
			deduped.map((l) => ({
				professionId,
				objectId: l.objectId,
				level: l.level,
				quantity: l.quantity,
				timeSeconds: l.timeSeconds,
			})) as Array<Partial<ProfessionObject>>,
		);

		return this.findByProfession(professionId);
	}
}
