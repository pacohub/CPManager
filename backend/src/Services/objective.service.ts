import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventDifficulty, EventType } from '../Entities/event.entity';
import { Mechanic } from '../Entities/mechanic.entity';
import { Objective } from '../Entities/objective.entity';
import { GameObject } from '../Entities/gameObject.entity';

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
		@InjectRepository(GameObject)
		private gameObjectRepository: Repository<GameObject>,
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

	private isObjectiveEventType(type: EventType): boolean {
		return (
			type === EventType.MISSION ||
			type === EventType.SECONDARY_MISSION ||
			type === EventType.DAILY_MISSION ||
			type === EventType.WEEKLY_MISSION
		);
	}

	async findAll(filters: ObjectiveFilters = {}): Promise<Objective[]> {
		const qb = this.objectiveRepository
			.createQueryBuilder('objective')
			.leftJoinAndSelect('objective.event', 'event')
			.leftJoinAndSelect('objective.mechanic', 'mechanic')
            .leftJoinAndSelect('objective.objects', 'objects')
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
			relations: { event: true, mechanic: true, objects: true },
		});
	}

	async create(data: any): Promise<Objective> {
		console.log('[ObjectiveService] create data preview:', { name: data?.name, objectIds: data?.objectIds });
		const eventId = Number(data?.eventId);
		const mechanicId = Number(data?.mechanicId);
		if (!Number.isFinite(eventId)) throw new BadRequestException('eventId es requerido');
		if (!Number.isFinite(mechanicId)) throw new BadRequestException('mechanicId es requerido');

		const event = await this.eventRepository.findOneBy({ id: eventId });
		if (!event) throw new NotFoundException('Evento no encontrado');
		if (!this.isObjectiveEventType(event.type)) {
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

		// attach objects if provided
		if (Array.isArray(data?.objectIds)) {
			const rawIds = (data.objectIds || []).slice();
			const ids = rawIds.map((v: any) => Number(v));
			const finite = ids.filter(Number.isFinite);
			if (finite.length !== ids.length) {
				console.warn('[ObjectiveService] create: some objectIds were not finite', { rawIds, ids });
			}
			if (finite.length) {
				const objs = await this.gameObjectRepository.findByIds(finite as any);
				if (objs.length !== finite.length) throw new NotFoundException('Algunos objetos asociados no fueron encontrados');
				objective.objects = objs;
			}
		}

		const saved = await this.objectiveRepository.save(objective);
		console.log('[ObjectiveService] create saved:', { id: saved.id, objects: (saved.objects || []).map((x: any) => x.id) });
		return saved;
	}

	async update(id: number, data: any): Promise<Objective> {
		console.log('[ObjectiveService] update data preview:', { id, objectIds: data?.objectIds });
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
			if (!this.isObjectiveEventType(event.type)) {
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

		if (data?.objectIds !== undefined) {
			if (!Array.isArray(data.objectIds)) throw new BadRequestException('objectIds debe ser un array');
			const rawIds = (data.objectIds || []).slice();
			const ids = rawIds.map((v: any) => Number(v));
			const finite = ids.filter(Number.isFinite);
			if (finite.length !== ids.length) {
				console.warn('[ObjectiveService] update: some objectIds were not finite', { rawIds, ids });
			}
			if (finite.length) {
				const objs = await this.gameObjectRepository.findByIds(finite as any);
				if (objs.length !== finite.length) throw new NotFoundException('Algunos objetos asociados no fueron encontrados');
				existing.objects = objs;
			} else {
				existing.objects = [];
			}
		}

		const saved = await this.objectiveRepository.save(existing);
		console.log('[ObjectiveService] update saved:', { id: saved.id, objects: (saved.objects || []).map((x: any) => x.id) });
		return saved;
	}

	async remove(id: number): Promise<void> {
		await this.objectiveRepository.delete(id);
	}
}
