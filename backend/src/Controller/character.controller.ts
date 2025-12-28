import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { Character } from '../Entities/character.entity';
import { CharacterService } from '../Services/character.service';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
	const ext = path.extname(file.originalname);
	const base = path.basename(file.originalname, ext);
	cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('characters')
export class CharacterController {
	constructor(
		private readonly characterService: CharacterService,
	) {}

	@Get()
	async findAll(): Promise<Character[]> {
		return this.characterService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Character | null> {
		return this.characterService.findOne(Number(id));
	}

	@Post()
	async create(@Body() data: any): Promise<Character> {
		return this.characterService.create(data);
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

	@Post('upload-image')
	@UseInterceptors(
		FileInterceptor('imageFile', {
			storage: diskStorage({
				destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
					cb(null, './uploads/images');
				},
				filename: fileName,
			}),
			limits: { fileSize: 10 * 1024 * 1024 },
		}),
	)
	async uploadImage(@UploadedFile() file?: Express.Multer.File): Promise<{ image: string }> {
		if (!file?.filename) return { image: '' };
		return { image: `/uploads/images/${file.filename}` };
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() data: any): Promise<Character | null> {
		return this.characterService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.characterService.remove(Number(id));
	}

	@Get(':id/instances')
	async getInstances(@Param('id') id: string): Promise<Character[]> {
		return this.characterService.getChildren(Number(id));
	}

	@Post(':id/instances')
	async createInstance(@Param('id') id: string, @Body() data: any): Promise<Character> {
		return this.characterService.createChild(Number(id), data);
	}

	@Put(':id/instances/:instanceId')
	async updateInstance(
		@Param('id') id: string,
		@Param('instanceId') instanceId: string,
		@Body() data: any,
	): Promise<Character | null> {
		return this.characterService.updateChild(Number(id), Number(instanceId), data);
	}

	@Delete(':id/instances/:instanceId')
	async removeInstance(@Param('id') id: string, @Param('instanceId') instanceId: string): Promise<void> {
		return this.characterService.removeChild(Number(id), Number(instanceId));
	}
}
