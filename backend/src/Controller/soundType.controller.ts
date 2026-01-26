import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { SoundType } from '../Entities/soundType.entity';
import { SoundTypeService } from '../Services/soundType.service';

@Controller('sound-types')
export class SoundTypeController {
	constructor(private readonly soundTypeService: SoundTypeService) {}

	@Get()
	async findAll(): Promise<SoundType[]> {
		return this.soundTypeService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<SoundType | null> {
		return this.soundTypeService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<SoundType> {
		return this.soundTypeService.create(data);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<SoundType | null> {
		return this.soundTypeService.update(Number(id), data);
	}

	@Get(':id/usage')
	async usage(@Param('id') id: string): Promise<{ count: number; soundIds: number[] }> {
		return this.soundTypeService.getUsage(Number(id));
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<{ removedCount: number; removedSoundIds: number[] }> {
		return this.soundTypeService.remove(Number(id));
	}
}
