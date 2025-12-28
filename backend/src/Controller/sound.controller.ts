import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { Sound } from '../Entities/sound.entity';
import { SoundService } from '../Services/sound.service';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
	const ext = path.extname(file.originalname);
	const base = path.basename(file.originalname, ext);
	cb(null, `${base}-${Date.now()}${ext}`);
}

function parseTypeIds(value: any): any {
	if (value === undefined || value === null) return undefined;
	if (Array.isArray(value)) return value;
	if (typeof value === 'string' && value.trim()) {
		try {
			const parsed = JSON.parse(value);
			return parsed;
		} catch {
			// allow comma-separated
			return value.split(',').map((x) => x.trim()).filter(Boolean);
		}
	}
	return value;
}

@Controller('sounds')
export class SoundController {
	constructor(private readonly soundService: SoundService) {}

	@Get()
	async findAll(): Promise<Sound[]> {
		return this.soundService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Sound | null> {
		return this.soundService.findOne(Number(id));
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor(
			[{ name: 'file', maxCount: 1 }],
			{
				storage: diskStorage({
					destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
						cb(null, './uploads/sounds');
					},
					filename: fileName,
				}),
				limits: { fileSize: 50 * 1024 * 1024 },
			},
		),
	)
	async create(@Body() data: any, @UploadedFiles() files: { file?: Express.Multer.File[] }): Promise<Sound> {
		if (files?.file?.[0]) data.file = `/uploads/sounds/${files.file[0].filename}`;
		data.typeIds = parseTypeIds(data.typeIds);
		return this.soundService.create(data);
	}

	@Put(':id')
	@UseInterceptors(
		FileFieldsInterceptor(
			[{ name: 'file', maxCount: 1 }],
			{
				storage: diskStorage({
					destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
						cb(null, './uploads/sounds');
					},
					filename: fileName,
				}),
				limits: { fileSize: 50 * 1024 * 1024 },
			},
		),
	)
	async update(
		@Param('id') id: string,
		@Body() data: any,
		@UploadedFiles() files: { file?: Express.Multer.File[] },
	): Promise<Sound | null> {
		if (files?.file?.[0]) data.file = `/uploads/sounds/${files.file[0].filename}`;
		data.typeIds = parseTypeIds(data.typeIds);
		return this.soundService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.soundService.remove(Number(id));
	}
}
