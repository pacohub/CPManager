import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { Faction } from '../Entities/faction.entity';
import { FactionService } from '../Services/faction.service';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
	const ext = path.extname(file.originalname);
	const base = path.basename(file.originalname, ext);
	cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('factions')
export class FactionController {
	constructor(private readonly factionService: FactionService) {}

	@Get()
	async findAll(): Promise<Faction[]> {
		return this.factionService.findAll();
	}

	@Get(':id/professions')
	async getProfessions(@Param('id') id: string): Promise<any[]> {
		return this.factionService.getProfessions(Number(id));
	}

	@Put(':id/professions')
	async setProfessions(@Param('id') id: string, @Body() body: any): Promise<Faction> {
		return this.factionService.setProfessionIds(Number(id), body?.professionIds ?? []);
	}

	@Get(':id/classes')
	async getClasses(@Param('id') id: string): Promise<any[]> {
		return this.factionService.getClasses(Number(id));
	}

	@Put(':id/classes')
	async setClasses(@Param('id') id: string, @Body() body: any): Promise<Faction> {
		return this.factionService.setClassIds(Number(id), body?.classIds ?? []);
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Faction | null> {
		return this.factionService.findOne(Number(id));
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'crestImage', maxCount: 1 },
				{ name: 'iconImage', maxCount: 1 },
			],
			{
				storage: diskStorage({
					destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
						cb(null, './uploads/images');
					},
					filename: fileName,
				}),
				limits: { fileSize: 10 * 1024 * 1024 },
			},
		),
	)
	async create(
		@Body() data: any,
		@UploadedFiles() files: { crestImage?: Express.Multer.File[]; iconImage?: Express.Multer.File[] },
	): Promise<Faction> {
		if (files?.crestImage?.[0]) data.crestImage = `/uploads/images/${files.crestImage[0].filename}`;
		if (files?.iconImage?.[0]) data.iconImage = `/uploads/images/${files.iconImage[0].filename}`;
		return this.factionService.create(data);
	}

	@Put(':id')
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'crestImage', maxCount: 1 },
				{ name: 'iconImage', maxCount: 1 },
			],
			{
				storage: diskStorage({
					destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
						cb(null, './uploads/images');
					},
					filename: fileName,
				}),
				limits: { fileSize: 10 * 1024 * 1024 },
			},
		),
	)
	async update(
		@Param('id') id: string,
		@Body() data: any,
		@UploadedFiles() files: { crestImage?: Express.Multer.File[]; iconImage?: Express.Multer.File[] },
	): Promise<Faction | null> {
		if (files?.crestImage?.[0]) data.crestImage = `/uploads/images/${files.crestImage[0].filename}`;
		if (files?.iconImage?.[0]) data.iconImage = `/uploads/images/${files.iconImage[0].filename}`;
		return this.factionService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.factionService.remove(Number(id));
	}
}
