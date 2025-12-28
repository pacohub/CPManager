import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ResourceType } from '../Entities/resourceType.entity';
import { ResourceTypeService } from '../Services/resourceType.service';

@Controller('resource-types')
export class ResourceTypeController {
	constructor(private readonly resourceTypeService: ResourceTypeService) {}

	@Get()
	async findAll(): Promise<ResourceType[]> {
		return this.resourceTypeService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<ResourceType | null> {
		return this.resourceTypeService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<ResourceType> {
		return this.resourceTypeService.create(data);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<ResourceType | null> {
		return this.resourceTypeService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.resourceTypeService.remove(Number(id));
	}
}
