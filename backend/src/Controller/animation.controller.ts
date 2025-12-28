import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Animation } from '../Entities/animation.entity';
import { AnimationService } from '../Services/animation.service';

@Controller('animations')
export class AnimationController {
	constructor(private readonly animationService: AnimationService) {}

	@Get()
	async findAll(): Promise<Animation[]> {
		return this.animationService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Animation | null> {
		return this.animationService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<Animation> {
		return this.animationService.create(data);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<Animation | null> {
		return this.animationService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.animationService.remove(Number(id));
	}
}
