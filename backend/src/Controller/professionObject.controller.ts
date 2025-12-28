import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ProfessionObject } from '../Entities/professionObject.entity';
import { ProfessionObjectService } from '../Services/professionObject.service';

@Controller('profession-objects')
export class ProfessionObjectController {
	constructor(private readonly professionObjectService: ProfessionObjectService) {}

	@Get(':professionId')
	async getForProfession(@Param('professionId') professionId: string): Promise<ProfessionObject[]> {
		return this.professionObjectService.findByProfession(Number(professionId));
	}

	@Put(':professionId')
	async replaceForProfession(@Param('professionId') professionId: string, @Body() body: any): Promise<ProfessionObject[]> {
		return this.professionObjectService.replaceForProfession(Number(professionId), body?.links ?? []);
	}
}
