import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ArmorType } from '../Entities/armorType.entity';
import { ArmorTypeService } from '../Services/armorType.service';

@Controller('armor-types')
export class ArmorTypeController {
	constructor(private readonly armorTypeService: ArmorTypeService) {}

	@Get()
	async findAll(): Promise<ArmorType[]> {
		return this.armorTypeService.findAll();
	}

	@Post('reset')
	async resetToDefaults(): Promise<ArmorType[]> {
		return this.armorTypeService.resetToDefaults();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<ArmorType | null> {
		return this.armorTypeService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<ArmorType> {
		return this.armorTypeService.create(data);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<ArmorType | null> {
		return this.armorTypeService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.armorTypeService.remove(Number(id));
	}
}
