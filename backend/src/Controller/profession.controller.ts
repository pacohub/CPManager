import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Profession } from '../Entities/profession.entity';
import { ProfessionService } from '../Services/profession.service';

@Controller('professions')
export class ProfessionController {
	constructor(private readonly professionService: ProfessionService) {}

	@Get()
	async findAll(): Promise<Profession[]> {
		return this.professionService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Profession | null> {
		return this.professionService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<Profession> {
		return this.professionService.create(data);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<Profession | null> {
		return this.professionService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.professionService.remove(Number(id));
	}
}
