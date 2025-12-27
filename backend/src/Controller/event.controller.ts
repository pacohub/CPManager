import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Event } from '../Entities/event.entity';
import { EventService } from '../Services/event.service';

@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@Get('count-by-chapter')
	async countByChapter(
		@Query('campaignId') campaignId?: string,
	): Promise<Array<{ chapterId: number; count: number; warningCount: number }>> {
		const id = Number(campaignId);
		if (!Number.isFinite(id)) return [];
		return this.eventService.countByChapterForCampaign(id);
	}

	@Get()
	async findAll(
		@Query('chapterId') chapterId?: string,
		@Query('mapId') mapId?: string,
	): Promise<Event[]> {
		const filters: { chapterId?: number; mapId?: number } = {};
		if (chapterId !== undefined && chapterId !== null && chapterId !== '') filters.chapterId = Number(chapterId);
		if (mapId !== undefined && mapId !== null && mapId !== '') filters.mapId = Number(mapId);
		return this.eventService.findAll(filters);
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Event | null> {
		return this.eventService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<Event> {
		return this.eventService.create(data);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<Event> {
		return this.eventService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.eventService.remove(Number(id));
	}
}

