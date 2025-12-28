import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { Resource } from '../Entities/resource.entity';
import { ResourceService } from '../Services/resource.service';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
	const ext = path.extname(file.originalname);
	const base = path.basename(file.originalname, ext);
	cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('resources')
export class ResourceController {
	constructor(private readonly resourceService: ResourceService) {}

	@Get()
	async findAll(): Promise<Resource[]> {
		return this.resourceService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Resource | null> {
		return this.resourceService.findOne(Number(id));
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor([{ name: 'icon', maxCount: 1 }], {
			storage: diskStorage({
				destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
					cb(null, './uploads/images');
				},
				filename: fileName,
			}),
			limits: { fileSize: 10 * 1024 * 1024 },
		}),
	)
	async create(@Body() data: any, @UploadedFiles() files: { icon?: Express.Multer.File[] }): Promise<Resource> {
		if (data?.resourceTypeId !== undefined) data.resourceTypeId = Number(data.resourceTypeId);
		if (files?.icon?.[0]) data.icon = `/uploads/images/${files.icon[0].filename}`;
		return this.resourceService.create(data);
	}

	@Put(':id')
	@UseInterceptors(
		FileFieldsInterceptor([{ name: 'icon', maxCount: 1 }], {
			storage: diskStorage({
				destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
					cb(null, './uploads/images');
				},
				filename: fileName,
			}),
			limits: { fileSize: 10 * 1024 * 1024 },
		}),
	)
	async update(
		@Param('id') id: string,
		@Body() data: any,
		@UploadedFiles() files: { icon?: Express.Multer.File[] },
	): Promise<Resource | null> {
		if (data?.resourceTypeId !== undefined) data.resourceTypeId = Number(data.resourceTypeId);
		if (files?.icon?.[0]) data.icon = `/uploads/images/${files.icon[0].filename}`;
		return this.resourceService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.resourceService.remove(Number(id));
	}
}
