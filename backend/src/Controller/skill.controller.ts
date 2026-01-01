import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import { Skill } from '../Entities/skill.entity';
import { SkillService } from '../Services/skill.service';
import { CreateSkillDto } from '../Dto/create-skill.dto';
import { UpdateSkillDto } from '../Dto/update-skill.dto';

@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  async findAll(): Promise<Skill[]> {
    return this.skillService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Skill | null> {
    return this.skillService.findOne(Number(id));
  }

  @Post()
  async create(@Body() data: CreateSkillDto): Promise<Skill> {
    const payload: any = { ...data };
    if ((data as any).casterVisualId) payload.casterVisual = { id: Number((data as any).casterVisualId) };
    if ((data as any).missileVisualId) payload.missileVisual = { id: Number((data as any).missileVisualId) };
    if ((data as any).targetVisualId) payload.targetVisual = { id: Number((data as any).targetVisualId) };
    delete payload.casterVisualId;
    delete payload.missileVisualId;
    delete payload.targetVisualId;
    return this.skillService.create(payload);
  }

  functionFileName(file: Express.Multer.File) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    return `${base}-${Date.now()}${ext}`;
  }

  @Post('upload-icon')
  @UseInterceptors(
    FileInterceptor('iconImage', {
      storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
          cb(null, './uploads/images');
        },
        filename: (req, file, cb) => cb(null, `${path.basename(file.originalname, path.extname(file.originalname))}-${Date.now()}${path.extname(file.originalname)}`),
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadIcon(@UploadedFile() file?: Express.Multer.File): Promise<{ icon: string }> {
    if (!file?.filename) return { icon: '' };
    return { icon: `/uploads/images/${file.filename}` };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateSkillDto): Promise<Skill | null> {
    const payload: any = { ...data };
    if ((data as any).casterVisualId) payload.casterVisual = { id: Number((data as any).casterVisualId) };
    if ((data as any).missileVisualId) payload.missileVisual = { id: Number((data as any).missileVisualId) };
    if ((data as any).targetVisualId) payload.targetVisual = { id: Number((data as any).targetVisualId) };
    delete payload.casterVisualId;
    delete payload.missileVisualId;
    delete payload.targetVisualId;
    return this.skillService.update(Number(id), payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.skillService.remove(Number(id));
  }

  @Post('import-blizzard')
  async importBlizzard(@Body() body: { region?: string; locale?: string; limit?: number } = {}): Promise<any> {
    try {
      const res = await this.skillService.importFromBlizzard({ region: body.region, locale: body.locale, limit: body.limit });
      return { ok: true, ...res };
    } catch (e: any) {
      return { ok: false, error: e?.message || String(e) };
    }
  }
}
