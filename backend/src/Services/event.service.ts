import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter, ChapterSpecialType } from '../Entities/chapter.entity';
import { Event, EventDifficulty, EventType } from '../Entities/event.entity';
import { Map } from '../Entities/map.entity';

type EventFilters = { chapterId?: number; mapId?: number };

@Injectable()
export class EventService {
	constructor(
		@InjectRepository(Event)
		private eventRepository: Repository<Event>,
		@InjectRepository(Chapter)
		private chapterRepository: Repository<Chapter>,
		@InjectRepository(Map)
		private mapRepository: Repository<Map>,
	) {}

	private normalizeText(value: any): string | undefined {
		if (value === undefined) return undefined;
		if (value === null) return '';
		return String(value).trim();
	}

	private assertEnumValue<T extends Record<string, string>>(enumObj: T, value: any, field: string) {
		if (value === undefined) return;
		const v = String(value);
		const allowed = new Set(Object.values(enumObj));
		if (!allowed.has(v)) {
			throw new BadRequestException(`Campo ${field} inválido: ${v}`);
		}
	}

	private normalizeNameForCompare(value: any): string {
		return String(value ?? '')
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');
	}

	private isCreditsChapter(chapter: Chapter): boolean {
		if ((chapter as any)?.specialType === ChapterSpecialType.CREDITS) return true;
		const name = this.normalizeNameForCompare((chapter as any)?.name);
		return name === 'creditos' || name === 'credits';
	}

	private assertCreditsAllowsType(chapter: Chapter, type: EventType) {
		if (!this.isCreditsChapter(chapter)) return;
		if (type !== EventType.CINEMATIC) {
			throw new BadRequestException('En el capítulo Créditos solo se permiten eventos de tipo CINEMATIC');
		}
	}

	async findAll(filters: EventFilters = {}): Promise<Event[]> {
		const qb = this.eventRepository
			.createQueryBuilder('event')
			.leftJoinAndSelect('event.chapter', 'chapter')
			.leftJoinAndSelect('event.map', 'map')
			.orderBy('event.position', 'ASC')
			.addOrderBy('event.id', 'ASC');

		if (filters.chapterId !== undefined) {
			qb.andWhere('chapter.id = :chapterId', { chapterId: filters.chapterId });
		}
		if (filters.mapId !== undefined) {
			qb.andWhere('map.id = :mapId', { mapId: filters.mapId });
		}

		return qb.getMany();
	}

	private async getNextPositionForChapter(chapterId: number): Promise<number> {
		const row = await this.eventRepository
			.createQueryBuilder('event')
			.leftJoin('event.chapter', 'chapter')
			.select('MAX(event.position)', 'max')
			.where('chapter.id = :chapterId', { chapterId })
			.getRawOne<{ max: string | number | null }>();

		const max = row?.max === null || row?.max === undefined ? -1 : Number(row.max);
		return Number.isFinite(max) ? max + 1 : 0;
	}

	async findOne(id: number): Promise<Event | null> {
		return this.eventRepository.findOne({
			where: { id },
			relations: { chapter: true, map: true },
		});
	}

	async create(data: any): Promise<Event> {
		const chapterId = Number(data?.chapterId);
		const mapId = Number(data?.mapId);
		if (!Number.isFinite(chapterId)) throw new BadRequestException('chapterId es requerido');
		if (!Number.isFinite(mapId)) throw new BadRequestException('mapId es requerido');

		const chapter = await this.chapterRepository.findOneBy({ id: chapterId });
		if (!chapter) throw new NotFoundException('Capítulo no encontrado');
		const map = await this.mapRepository.findOneBy({ id: mapId });
		if (!map) throw new NotFoundException('Mapa no encontrado');

		const name = this.normalizeText(data?.name);
		if (!name) throw new BadRequestException('name es requerido');

		const type = this.normalizeText(data?.type);
		const difficulty = this.normalizeText(data?.difficulty);
		this.assertEnumValue(EventType, type, 'type');
		this.assertEnumValue(EventDifficulty, difficulty, 'difficulty');

		const resolvedType = (type as EventType) ?? EventType.MISSION;
		this.assertCreditsAllowsType(chapter, resolvedType);

		const nextPosition = await this.getNextPositionForChapter(chapterId);

		const event = this.eventRepository.create({
			position: nextPosition,
			name,
			description: this.normalizeText(data?.description) ?? '',
			type: resolvedType,
			difficulty: (difficulty as EventDifficulty) ?? EventDifficulty.NORMAL,
			file: this.normalizeText(data?.file) ?? '',
			chapter,
			map,
		});

		return this.eventRepository.save(event);
	}

	async update(id: number, data: any): Promise<Event> {
		const existing = await this.findOne(id);
		if (!existing) throw new NotFoundException('Evento no encontrado');

		let nextChapter = existing.chapter;
		let nextType: EventType = existing.type;

		if (data?.position !== undefined) {
			const position = Number(data.position);
			if (!Number.isFinite(position) || position < 0) throw new BadRequestException('position inválido');
			existing.position = Math.trunc(position);
		}

		if (data?.name !== undefined) {
			const next = this.normalizeText(data?.name);
			if (!next) throw new BadRequestException('name es requerido');
			existing.name = next;
		}

		if (data?.description !== undefined) existing.description = this.normalizeText(data?.description) ?? '';
		if (data?.file !== undefined) existing.file = this.normalizeText(data?.file) ?? '';

		if (data?.type !== undefined) {
			const t = this.normalizeText(data?.type);
			this.assertEnumValue(EventType, t, 'type');
			nextType = t as EventType;
		}

		if (data?.difficulty !== undefined) {
			const d = this.normalizeText(data?.difficulty);
			this.assertEnumValue(EventDifficulty, d, 'difficulty');
			existing.difficulty = d as EventDifficulty;
		}

		if (data?.chapterId !== undefined) {
			const chapterId = Number(data.chapterId);
			if (!Number.isFinite(chapterId)) throw new BadRequestException('chapterId inválido');
			const chapter = await this.chapterRepository.findOneBy({ id: chapterId });
			if (!chapter) throw new NotFoundException('Capítulo no encontrado');
			nextChapter = chapter;
		}

		this.assertCreditsAllowsType(nextChapter, nextType);

		existing.type = nextType;
		existing.chapter = nextChapter;

		if (data?.mapId !== undefined) {
			const mapId = Number(data.mapId);
			if (!Number.isFinite(mapId)) throw new BadRequestException('mapId inválido');
			const map = await this.mapRepository.findOneBy({ id: mapId });
			if (!map) throw new NotFoundException('Mapa no encontrado');
			existing.map = map;
		}

		return this.eventRepository.save(existing);
	}

	async remove(id: number): Promise<void> {
		await this.eventRepository.delete(id);
	}

	async countByChapterForCampaign(
		campaignId: number,
	): Promise<Array<{ chapterId: number; count: number; warningCount: number; missionCount: number; cinematicCount: number }>> {
		const rows = await this.eventRepository
			.createQueryBuilder('event')
			.leftJoin('event.chapter', 'chapter')
			.select('chapter.id', 'chapterId')
			.addSelect('COUNT(event.id)', 'count')
			.addSelect("SUM(CASE WHEN event.type = 'MISSION' THEN 1 ELSE 0 END)", 'missionCount')
			.addSelect("SUM(CASE WHEN event.type = 'CINEMATIC' THEN 1 ELSE 0 END)", 'cinematicCount')
			.addSelect(
				"SUM(CASE WHEN event.description IS NULL OR TRIM(event.description) = '' THEN 1 ELSE 0 END)",
				'warningCount',
			)
			.where('chapter.campaignId = :campaignId', { campaignId })
			.groupBy('chapter.id')
			.getRawMany<{ chapterId: string; count: string; warningCount: string; missionCount: string; cinematicCount: string }>();

		return (rows ?? []).map((r) => ({
			chapterId: Number(r.chapterId),
			count: Number(r.count),
			warningCount: Number(r.warningCount ?? 0),
			missionCount: Number((r as any).missionCount ?? 0),
			cinematicCount: Number((r as any).cinematicCount ?? 0),
		}));
	}
}

