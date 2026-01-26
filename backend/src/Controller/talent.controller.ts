import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { Talent } from '../Entities/talent.entity';
import { TalentService } from '../Services/talent.service';

@Controller('talents')
export class TalentController {
  constructor(private readonly talentService: TalentService) {}

  @Get()
  async findAll(): Promise<Talent[]> {
    return this.talentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Talent | null> {
    return this.talentService.findOne(Number(id));
  }

  @Post()
  async create(@Body() data: any): Promise<Talent> {
    return this.talentService.create(data);
  }

  @Post('upload-icon')
  @UseInterceptors(FileInterceptor('iconImage', {
    storage: diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, './uploads/images');
      },
      filename: (req, file, cb) => cb(null, `${path.basename(file.originalname, path.extname(file.originalname))}-${Date.now()}${path.extname(file.originalname)}`),
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadIcon(@UploadedFile() file?: Express.Multer.File): Promise<{ icon: string }> {
    if (!file?.filename) return { icon: '' };
    return { icon: `/uploads/images/${file.filename}` };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<Talent | null> {
    return this.talentService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.talentService.remove(Number(id));
  }
}
