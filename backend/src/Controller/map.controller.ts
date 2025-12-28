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
import { Component } from '../Entities/component.entity';
import { Map } from '../Entities/map.entity';
import { MapService } from '../Services/map.service';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext);
  cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('maps')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  async findAll(): Promise<Map[]> {
    return this.mapService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Map | null> {
    return this.mapService.findOne(Number(id));
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
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
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ): Promise<Map> {
    if (files?.image?.[0]) data.image = `/uploads/images/${files.image[0].filename}`;
    return this.mapService.create(data);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
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
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ): Promise<Map | null> {
    if (files?.image?.[0]) data.image = `/uploads/images/${files.image[0].filename}`;
    return this.mapService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.mapService.remove(Number(id));
  }

  @Get(':id/components')
  async getComponents(@Param('id') id: string): Promise<Component[]> {
    return this.mapService.getComponents(Number(id));
  }

  @Put(':id/components')
  async setComponents(@Param('id') id: string, @Body() body: any): Promise<Map> {
    return this.mapService.setComponentIds(Number(id), body?.componentIds ?? []);
  }
}
