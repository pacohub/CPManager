import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Campaign } from '../Entities/campaign.entity';
import { GameObject } from '../Entities/gameObject.entity';
import { GameObjectService } from '../Services/gameObject.service';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
	const ext = path.extname(file.originalname);
	const base = path.basename(file.originalname, ext);
	cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('objects')
export class GameObjectController {
	constructor(private readonly gameObjectService: GameObjectService) {}

	@Get()
	async findAll(): Promise<GameObject[]> {
		return this.gameObjectService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<GameObject | null> {
		return this.gameObjectService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<GameObject> {
		return this.gameObjectService.create(data);
	}

	@Post('upload-icon')
	@UseInterceptors(
		FileInterceptor('iconImage', {
			storage: diskStorage({
				destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
					cb(null, './uploads/images');
				},
				filename: fileName,
			}),
			limits: { fileSize: 10 * 1024 * 1024 },
		}),
	)
	async uploadIcon(@UploadedFile() file?: Express.Multer.File): Promise<{ icon: string }> {
		if (!file?.filename) return { icon: '' };
		return { icon: `/uploads/images/${file.filename}` };
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<GameObject | null> {
		return this.gameObjectService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.gameObjectService.remove(Number(id));
	}

	@Get(':id/campaigns')
	async getCampaigns(@Param('id') id: string): Promise<Campaign[]> {
		return this.gameObjectService.getCampaigns(Number(id));
	}

	@Put(':id/campaigns')
	async setCampaigns(@Param('id') id: string, @Body() body: any): Promise<GameObject> {
		return this.gameObjectService.setCampaignIds(Number(id), body?.campaignIds ?? []);
	}
}
