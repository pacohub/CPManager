import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DefenseType } from '../Entities/defenseType.entity';
import { DefenseTypeService } from '../Services/defenseType.service';

@Controller('defense-types')
export class DefenseTypeController {
	constructor(private readonly defenseTypeService: DefenseTypeService) {}

	@Get()
	async findAll(): Promise<DefenseType[]> {
		return this.defenseTypeService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<DefenseType | null> {
		return this.defenseTypeService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<DefenseType> {
		return this.defenseTypeService.create(data);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<DefenseType | null> {
		return this.defenseTypeService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.defenseTypeService.remove(Number(id));
	}
}
