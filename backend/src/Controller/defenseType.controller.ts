import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
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

	@Post('upload-icon')
	@UseInterceptors(
		FileInterceptor('iconImage', {
			storage: diskStorage({
				destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
					cb(null, './uploads/images');
				},
				filename: (req, file, cb) => {
					const ext = path.extname(file.originalname);
					const base = path.basename(file.originalname, ext);
					cb(null, `${base}-${Date.now()}${ext}`);
				},
			}),
			limits: { fileSize: 10 * 1024 * 1024 },
		}),
	)
	async uploadIcon(@UploadedFile() file?: Express.Multer.File): Promise<{ icon: string }> {
		if (!file?.filename) return { icon: '' };
		return { icon: `/uploads/images/${file.filename}` };
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
