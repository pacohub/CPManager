import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Mechanic } from '../Entities/mechanic.entity';
import { MechanicService } from '../Services/mechanic.service';

@Controller('mechanics')
export class MechanicController {
	constructor(private readonly mechanicService: MechanicService) {}

	@Get()
	async findAll(): Promise<Mechanic[]> {
		return this.mechanicService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Mechanic | null> {
		return this.mechanicService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<Mechanic> {
		return this.mechanicService.create(data);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<Mechanic | null> {
		return this.mechanicService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.mechanicService.remove(Number(id));
	}
}
