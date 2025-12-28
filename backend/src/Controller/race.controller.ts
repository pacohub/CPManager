import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { Race } from '../Entities/race.entity';
import { RaceService } from '../Services/race.service';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
	const ext = path.extname(file.originalname);
	const base = path.basename(file.originalname, ext);
	cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('races')
export class RaceController {
	constructor(private readonly raceService: RaceService) {}

	@Get()
	async findAll(): Promise<Race[]> {
		return this.raceService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Race | null> {
		return this.raceService.findOne(Number(id));
	}

	@Post('upload-icon')
	@UseInterceptors(
		FileInterceptor('iconFile', {
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
		return { icon: file ? `/uploads/images/${file.filename}` : '' };
	}

	@Post()
	async create(@Body() data: any): Promise<Race> {
		return this.raceService.create(data);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<Race | null> {
		return this.raceService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.raceService.remove(Number(id));
	}
}
