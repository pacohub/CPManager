import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Component } from '../Entities/component.entity';
import { ComponentService } from '../Services/component.service';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
	const ext = path.extname(file.originalname);
	const base = path.basename(file.originalname, ext);
	cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('components')
export class ComponentController {
	constructor(private readonly componentService: ComponentService) {}

	@Get()
	async findAll(): Promise<Component[]> {
		return this.componentService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Component | null> {
		return this.componentService.findOne(Number(id));
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor(
			[{ name: 'image', maxCount: 1 }],
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
	async create(@Body() data: any, @UploadedFiles() files: { image?: Express.Multer.File[] }): Promise<Component> {
		if (files?.image?.[0]) data.image = `/uploads/images/${files.image[0].filename}`;
		return this.componentService.create(data);
	}

	@Put(':id')
	@UseInterceptors(
		FileFieldsInterceptor(
			[{ name: 'image', maxCount: 1 }],
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
		@UploadedFiles() files: { image?: Express.Multer.File[] },
	): Promise<Component | null> {
		if (files?.image?.[0]) data.image = `/uploads/images/${files.image[0].filename}`;
		return this.componentService.update(Number(id), data);
	}

	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return this.componentService.remove(Number(id));
	}
}
