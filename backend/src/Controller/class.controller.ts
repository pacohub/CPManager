import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { Class } from '../Entities/class.entity';
import { ClassService } from '../Services/class.service';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
	const ext = path.extname(file.originalname);
	const base = path.basename(file.originalname, ext);
	cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('classes')
export class ClassController {
	constructor(private readonly classService: ClassService) {}

	@Get()
	async findAll(): Promise<Class[]> {
		return this.classService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Class | null> {
		return this.classService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<Class> {
		return this.classService.create(data);
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
	async update(@Param('id') id: string, @Body() data: any): Promise<Class | null> {
		return this.classService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.classService.remove(Number(id));
	}
}
