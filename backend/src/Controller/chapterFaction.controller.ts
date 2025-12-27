import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ChapterFactionService } from '../Services/chapterFaction.service';
import { ChapterFaction } from '../Entities/chapterFaction.entity';

@Controller('chapter-factions')
export class ChapterFactionController {
	constructor(private readonly chapterFactionService: ChapterFactionService) {}

	@Get('by-campaign')
	async byCampaign(@Query('campaignId') campaignId: string): Promise<Record<number, ChapterFaction[]>> {
		const id = Number(campaignId);
		if (!Number.isFinite(id)) return {};
		const list = await this.chapterFactionService.findByCampaign(id);
		const map: Record<number, ChapterFaction[]> = {};
		for (const item of list) {
			if (!map[item.chapterId]) map[item.chapterId] = [];
			map[item.chapterId].push(item);
		}
		return map;
	}

	@Get(':chapterId')
	async getForChapter(@Param('chapterId') chapterId: string): Promise<ChapterFaction[]> {
		return this.chapterFactionService.findByChapter(Number(chapterId));
	}

	@Put(':chapterId')
	async replaceForChapter(@Param('chapterId') chapterId: string, @Body() body: any): Promise<ChapterFaction[]> {
		return this.chapterFactionService.replaceForChapter(Number(chapterId), body?.links ?? []);
	}

	@Put(':chapterId/:factionId/color')
	async setColorOverride(
		@Param('chapterId') chapterId: string,
		@Param('factionId') factionId: string,
		@Body() body: any,
	): Promise<ChapterFaction | null> {
		return this.chapterFactionService.setColorOverride(Number(chapterId), Number(factionId), body?.colorOverride ?? null);
	}
}
