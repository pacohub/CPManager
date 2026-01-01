import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { VisualEffect } from '../Entities/visualEffect.entity';
import { VisualEffectService } from '../Services/visualEffect.service';
import { CreateVisualEffectDto } from '../Dto/create-visualEffect.dto';
import { UpdateVisualEffectDto } from '../Dto/update-visualEffect.dto';

@Controller('visual-effects')
export class VisualEffectController {
  constructor(private readonly visualEffectService: VisualEffectService) {}

  @Get()
  async findAll(): Promise<VisualEffect[]> {
    return this.visualEffectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<VisualEffect | null> {
    return this.visualEffectService.findOne(Number(id));
  }

  @Post()
  async create(@Body() data: CreateVisualEffectDto): Promise<VisualEffect> {
    const payload: any = { ...data };
    if ((data as any).soundId) payload.sound = { id: Number((data as any).soundId) };
    delete payload.soundId;
    return this.visualEffectService.create(payload);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateVisualEffectDto): Promise<VisualEffect | null> {
    const payload: any = { ...data };
    if ((data as any).soundId) payload.sound = { id: Number((data as any).soundId) };
    delete payload.soundId;
    return this.visualEffectService.update(Number(id), payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.visualEffectService.remove(Number(id));
  }
}
