import { Controller, Get, Post, Put, Delete, Query, Param, Body, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CampaignService } from '../Services/campaign.service';
import { Campaign } from '../Entities/campaign.entity';
import { diskStorage, FileFilterCallback } from 'multer';
import { Request } from 'express';
import * as path from 'path';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext);
  cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  async findAllBySaga(@Query('sagaId') sagaId: string): Promise<Campaign[]> {
    return this.campaignService.findAllBySaga(Number(sagaId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Campaign | null> {
    return this.campaignService.findOne(Number(id));
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        if (file.fieldname === 'image') cb(null, './uploads/images');
        else cb(null, './uploads/files');
      },
      filename: fileName,
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async create(
    @Body() data: any,
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] }
  ): Promise<Campaign> {
    if (data?.sagaId !== undefined) data.sagaId = Number(data.sagaId);
    if (data?.order !== undefined) data.order = Number(data.order);
    if (files?.image?.[0]) data.image = `/uploads/images/${files.image[0].filename}`;
    if (files?.file?.[0]) data.file = `/uploads/files/${files.file[0].filename}`;
    return this.campaignService.create(data);
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        if (file.fieldname === 'image') cb(null, './uploads/images');
        else cb(null, './uploads/files');
      },
      filename: fileName,
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] }
  ): Promise<Campaign | null> {
    if (data?.sagaId !== undefined) data.sagaId = Number(data.sagaId);
    if (data?.order !== undefined) data.order = Number(data.order);
    if (files?.image?.[0]) data.image = `/uploads/images/${files.image[0].filename}`;
    if (files?.file?.[0]) data.file = `/uploads/files/${files.file[0].filename}`;
    return this.campaignService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.campaignService.remove(Number(id));
  }
}
