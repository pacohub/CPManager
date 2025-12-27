import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventDifficulty, EventType } from '../Entities/event.entity';
import { Mechanic } from '../Entities/mechanic.entity';
import { Objective } from '../Entities/objective.entity';

type ObjectiveFilters = { eventId?: number; mechanicId?: number; chapterId?: number };

@Injectable()
export class ObjectiveService {
	constructor(
		@InjectRepository(Objective)
		private objectiveRepository: Repository<Objective>,
		@InjectRepository(Event)
		private eventRepository: Repository<Event>,
		@InjectRepository(Mechanic)
		private mechanicRepository: Repository<Mechanic>,
	) {}

	private normalizeText(value: any): string | undefined {
		if (value === undefined) return undefined;
		if (value === null) return '';
		return String(value).trim();
	}

	private assertDifficulty(value: any) {
		if (value === undefined) return;
		const v = String(value);
		const allowed = new Set(Object.values(EventDifficulty));
		if (!allowed.has(v as any)) {
			throw new BadRequestException(`difficulty inválido: ${v}`);
		}
	}

	private toInt(value: any, field: string): number {
		const n = Number(value);
		if (!Number.isFinite(n)) throw new BadRequestException(`${field} inválido`);
		return Math.trunc(n);
	}

	async findAll(filters: ObjectiveFilters = {}): Promise<Objective[]> {
		const qb = this.objectiveRepository
			.createQueryBuilder('objective')
			.leftJoinAndSelect('objective.event', 'event')
			.leftJoinAndSelect('objective.mechanic', 'mechanic')
			.orderBy('objective.position', 'ASC')
			.addOrderBy('objective.id', 'ASC');

		if (filters.eventId !== undefined) {
			qb.andWhere('event.id = :eventId', { eventId: filters.eventId });
		}
		if (filters.mechanicId !== undefined) {
			qb.andWhere('mechanic.id = :mechanicId', { mechanicId: filters.mechanicId });
		}
		if (filters.chapterId !== undefined) {
			qb.leftJoin('event.chapter', 'chapter');
			qb.andWhere('chapter.id = :chapterId', { chapterId: filters.chapterId });
		}

		return qb.getMany();
	}

	async findOne(id: number): Promise<Objective | null> {
		return this.objectiveRepository.findOne({
			where: { id },
			relations: { event: true, mechanic: true },
		});
	}

	async create(data: any): Promise<Objective> {
		const eventId = Number(data?.eventId);
		const mechanicId = Number(data?.mechanicId);
		if (!Number.isFinite(eventId)) throw new BadRequestException('eventId es requerido');
		if (!Number.isFinite(mechanicId)) throw new BadRequestException('mechanicId es requerido');

		const event = await this.eventRepository.findOneBy({ id: eventId });
		if (!event) throw new NotFoundException('Evento no encontrado');
		if (event.type !== EventType.MISSION) {
			throw new BadRequestException('Los objetivos solo pueden pertenecer a eventos de tipo MISSION');
		}
		const mechanic = await this.mechanicRepository.findOneBy({ id: mechanicId });
		if (!mechanic) throw new NotFoundException('Mecánica no encontrada');

		const maxRow = await this.objectiveRepository
			.createQueryBuilder('objective')
			.select('MAX(objective.position)', 'max')
			.leftJoin('objective.event', 'event')
			.where('event.id = :eventId', { eventId })
			.getRawOne<{ max: string | number | null }>();
		const nextPosition = Math.max(0, Number(maxRow?.max ?? -1) + 1);

		const name = this.normalizeText(data?.name);
		if (!name) throw new BadRequestException('name es requerido');

		const difficulty = this.normalizeText(data?.difficulty);
		this.assertDifficulty(difficulty);

		const objective = this.objectiveRepository.create({
			position: data?.position !== undefined ? this.toInt(data.position, 'position') : nextPosition,
			name,
			description: this.normalizeText(data?.description) ?? '',
			detailedDescription: this.normalizeText(data?.detailedDescription) ?? '',
			difficulty: (difficulty as EventDifficulty) ?? EventDifficulty.NORMAL,
			initialValue: data?.initialValue !== undefined ? this.toInt(data.initialValue, 'initialValue') : 0,
			difficultyIncrement:
				data?.difficultyIncrement !== undefined ? this.toInt(data.difficultyIncrement, 'difficultyIncrement') : 0,
			event,
			mechanic,
		});

		return this.objectiveRepository.save(objective);
	}

	async update(id: number, data: any): Promise<Objective> {
		const existing = await this.findOne(id);
		if (!existing) throw new NotFoundException('Objetivo no encontrado');

		if (data?.name !== undefined) {
			const name = this.normalizeText(data?.name);
			if (!name) throw new BadRequestException('name es requerido');
			existing.name = name;
		}
		if (data?.description !== undefined) existing.description = this.normalizeText(data?.description) ?? '';
		if (data?.detailedDescription !== undefined) {
			existing.detailedDescription = this.normalizeText(data?.detailedDescription) ?? '';
		}

		if (data?.difficulty !== undefined) {
			const difficulty = this.normalizeText(data?.difficulty);
			this.assertDifficulty(difficulty);
			existing.difficulty = difficulty as EventDifficulty;
		}

		if (data?.initialValue !== undefined) {
			existing.initialValue = this.toInt(data.initialValue, 'initialValue');
		}
		if (data?.difficultyIncrement !== undefined) {
			existing.difficultyIncrement = this.toInt(data.difficultyIncrement, 'difficultyIncrement');
		}

		if (data?.position !== undefined) {
			existing.position = this.toInt(data.position, 'position');
		}

		if (data?.eventId !== undefined) {
			const eventId = Number(data.eventId);
			if (!Number.isFinite(eventId)) throw new BadRequestException('eventId inválido');
			const event = await this.eventRepository.findOneBy({ id: eventId });
			if (!event) throw new NotFoundException('Evento no encontrado');
			if (event.type !== EventType.MISSION) {
				throw new BadRequestException('Los objetivos solo pueden pertenecer a eventos de tipo MISSION');
			}
			existing.event = event;
		}

		if (data?.mechanicId !== undefined) {
			const mechanicId = Number(data.mechanicId);
			if (!Number.isFinite(mechanicId)) throw new BadRequestException('mechanicId inválido');
			const mechanic = await this.mechanicRepository.findOneBy({ id: mechanicId });
			if (!mechanic) throw new NotFoundException('Mecánica no encontrada');
			existing.mechanic = mechanic;
		}

		return this.objectiveRepository.save(existing);
	}

	async remove(id: number): Promise<void> {
		await this.objectiveRepository.delete(id);
	}
}
