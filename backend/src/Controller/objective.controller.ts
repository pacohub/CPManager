import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Objective } from '../Entities/objective.entity';
import { ObjectiveService } from '../Services/objective.service';

@Controller('objectives')
export class ObjectiveController {
	constructor(private readonly objectiveService: ObjectiveService) {}

	@Get()
	async findAll(
		@Query('eventId') eventId?: string,
		@Query('mechanicId') mechanicId?: string,
		@Query('chapterId') chapterId?: string,
	): Promise<Objective[]> {
		const filters: { eventId?: number; mechanicId?: number; chapterId?: number } = {};
		if (eventId !== undefined && eventId !== null && eventId !== '') filters.eventId = Number(eventId);
		if (mechanicId !== undefined && mechanicId !== null && mechanicId !== '') filters.mechanicId = Number(mechanicId);
		if (chapterId !== undefined && chapterId !== null && chapterId !== '') filters.chapterId = Number(chapterId);
		return this.objectiveService.findAll(filters);
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Objective | null> {
		return this.objectiveService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<Objective> {
		return this.objectiveService.create(data);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<Objective> {
		return this.objectiveService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.objectiveService.remove(Number(id));
	}
}
