import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ProfessionObjectResource } from '../Entities/professionObjectResource.entity';
import { ProfessionObjectResourceService } from '../Services/professionObjectResource.service';

@Controller('profession-object-resources')
export class ProfessionObjectResourceController {
	constructor(private readonly professionObjectResourceService: ProfessionObjectResourceService) {}

	@Get('by-profession')
	async byProfession(@Query('professionId') professionId: string): Promise<Record<number, ProfessionObjectResource[]>> {
		const id = Number(professionId);
		if (!Number.isFinite(id)) return {};
		const list = await this.professionObjectResourceService.findByProfession(id);
		const map: Record<number, ProfessionObjectResource[]> = {};
		for (const item of list) {
			if (!map[item.objectId]) map[item.objectId] = [];
			map[item.objectId].push(item);
		}
		return map;
	}

	@Get(':professionId/:objectId')
	async getForObject(
		@Param('professionId') professionId: string,
		@Param('objectId') objectId: string,
	): Promise<ProfessionObjectResource[]> {
		return this.professionObjectResourceService.findForObject(Number(professionId), Number(objectId));
	}

	@Put(':professionId/:objectId')
	async replaceForObject(
		@Param('professionId') professionId: string,
		@Param('objectId') objectId: string,
		@Body() body: any,
	): Promise<ProfessionObjectResource[]> {
		return this.professionObjectResourceService.replaceForObject(Number(professionId), Number(objectId), body?.links ?? []);
	}
}
