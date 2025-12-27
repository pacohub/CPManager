import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChapterFaction } from '../Entities/chapterFaction.entity';
import { Chapter } from '../Entities/chapter.entity';

export type ChapterFactionInput = {
	factionId: number;
	groupName: string;
	order?: number;
	isPlayable?: boolean;
	colorOverride?: string;
};

@Injectable()
export class ChapterFactionService {
	constructor(
		@InjectRepository(ChapterFaction)
		private chapterFactionRepository: Repository<ChapterFaction>,
		@InjectRepository(Chapter)
		private chapterRepository: Repository<Chapter>,
	) {}

	async findByChapter(chapterId: number): Promise<ChapterFaction[]> {
		return this.chapterFactionRepository
			.createQueryBuilder('cf')
			.where('cf.chapterId = :chapterId', { chapterId })
			.orderBy('LOWER(cf.groupName)', 'ASC')
			.addOrderBy('cf.order', 'ASC')
			.addOrderBy('cf.id', 'ASC')
			.getMany();
	}

	async findByCampaign(campaignId: number): Promise<ChapterFaction[]> {
		return this.chapterFactionRepository
			.createQueryBuilder('cf')
			.innerJoin(Chapter, 'ch', 'ch.id = cf.chapterId')
			.where('ch.campaignId = :campaignId', { campaignId })
			.orderBy('cf.chapterId', 'ASC')
			.addOrderBy('LOWER(cf.groupName)', 'ASC')
			.addOrderBy('cf.order', 'ASC')
			.addOrderBy('cf.id', 'ASC')
			.getMany();
	}

	async replaceForChapter(chapterId: number, links: ChapterFactionInput[]): Promise<ChapterFaction[]> {
		const cleaned = (links ?? [])
			.filter((l) => l && Number.isFinite(Number(l.factionId)))
			.map((l) => ({
				factionId: Number(l.factionId),
				groupName: String(l.groupName ?? '').trim() || 'Grupo',
				order: Number.isFinite(Number(l.order)) ? Number(l.order) : 0,
				isPlayable: Boolean(l.isPlayable),
				colorOverride: typeof l.colorOverride === 'string' ? l.colorOverride.trim() : null,
			}));

		if (cleaned.length > 24) {
			throw new Error('Máximo 24 facciones por capítulo');
		}

		// Ensure at most 1 playable
		let playableSeen = false;
		for (const l of cleaned) {
			if (!l.isPlayable) continue;
			if (playableSeen) l.isPlayable = false;
			playableSeen = true;
		}

		// Ensure chapter exists (avoid orphan links)
		const chapter = await this.chapterRepository.findOneBy({ id: chapterId });
		if (!chapter) throw new Error('Capítulo no encontrado');

		await this.chapterFactionRepository.delete({ chapterId });
		if (cleaned.length === 0) return [];

		const entities = cleaned.map((l) => ({
			chapterId,
			factionId: l.factionId,
			groupName: l.groupName,
			order: l.order ?? 0,
			isPlayable: l.isPlayable,
			colorOverride: l.colorOverride ? l.colorOverride : null,
		})) as Array<Partial<ChapterFaction>>;

		await this.chapterFactionRepository.save(entities);
		return this.findByChapter(chapterId);
	}

	async setColorOverride(chapterId: number, factionId: number, colorOverride: string | null): Promise<ChapterFaction | null> {
		const existing = await this.chapterFactionRepository.findOneBy({ chapterId, factionId });
		if (!existing) return null;
		existing.colorOverride = (colorOverride ?? '').trim() || null;
		await this.chapterFactionRepository.save(existing);
		return existing;
	}
}
