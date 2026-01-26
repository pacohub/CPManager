import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { TalentTree } from '../Entities/talentTree.entity';
import { TalentTreeService } from '../Services/talentTree.service';

function fileName(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext);
  cb(null, `${base}-${Date.now()}${ext}`);
}

@Controller('talent-trees')
export class TalentTreeController {
  constructor(private readonly treeService: TalentTreeService) {}

  @Get()
  async findAll(): Promise<TalentTree[]> {
    return this.treeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TalentTree | null> {
    return this.treeService.findOne(Number(id));
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, './uploads/images');
      },
      filename: fileName,
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async create(@Body() data: any, @UploadedFiles() files: { file?: Express.Multer.File[] }): Promise<TalentTree> {
    if (files?.file?.[0]) data.file = `/uploads/images/${files.file[0].filename}`;
    return this.treeService.create(data);
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, './uploads/images');
      },
      filename: fileName,
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async update(@Param('id') id: string, @Body() data: any, @UploadedFiles() files: { file?: Express.Multer.File[] }): Promise<TalentTree | null> {
    if (files?.file?.[0]) data.file = `/uploads/images/${files.file[0].filename}`;
    return this.treeService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.treeService.remove(Number(id));
  }
}
