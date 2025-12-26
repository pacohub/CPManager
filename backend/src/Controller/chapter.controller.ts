import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { Chapter } from '../Entities/chapter.entity';
import { ChapterService } from '../Services/chapter.service';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext);
  cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('chapters')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Get()
  async findAllByCampaign(@Query('campaignId') campaignId?: string): Promise<Chapter[]> {
    if (campaignId === undefined || campaignId === null || campaignId === '') {
      return this.chapterService.findAll();
    }
    return this.chapterService.findAllByCampaign(Number(campaignId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Chapter | null> {
    return this.chapterService.findOne(Number(id));
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
            if (file.fieldname === 'image') cb(null, './uploads/images');
            else cb(null, './uploads/files');
          },
          filename: fileName,
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  async create(
    @Body() data: any,
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
  ): Promise<Chapter> {
    if (data?.campaignId !== undefined) data.campaignId = Number(data.campaignId);
    if (data?.order !== undefined) data.order = Number(data.order);
    if (files?.image?.[0]) data.image = `/uploads/images/${files.image[0].filename}`;
    if (files?.file?.[0]) data.file = `/uploads/files/${files.file[0].filename}`;
    return this.chapterService.create(data);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
            if (file.fieldname === 'image') cb(null, './uploads/images');
            else cb(null, './uploads/files');
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
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
  ): Promise<Chapter | null> {
    if (data?.campaignId !== undefined) data.campaignId = Number(data.campaignId);
    if (data?.order !== undefined) data.order = Number(data.order);
    if (files?.image?.[0]) data.image = `/uploads/images/${files.image[0].filename}`;
    if (files?.file?.[0]) data.file = `/uploads/files/${files.file[0].filename}`;
    return this.chapterService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.chapterService.remove(Number(id));
  }
}
