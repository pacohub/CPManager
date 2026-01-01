import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { SkillEffect } from '../Entities/skillEffect.entity';
import { SkillEffectService } from '../Services/skillEffect.service';
import { CreateSkillEffectDto } from '../Dto/create-skillEffect.dto';
import { UpdateSkillEffectDto } from '../Dto/update-skillEffect.dto';

@Controller('skill-effects')
export class SkillEffectController {
  constructor(private readonly skillEffectService: SkillEffectService) {}

  @Get()
  async findAll(): Promise<SkillEffect[]> {
    return this.skillEffectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SkillEffect | null> {
    return this.skillEffectService.findOne(Number(id));
  }

  @Post()
  async create(@Body() data: CreateSkillEffectDto): Promise<SkillEffect> {
    const payload: any = { ...data };
    if ((data as any).skillId) payload.skill = { id: Number((data as any).skillId) };
    if ((data as any).effectId) payload.effect = { id: Number((data as any).effectId) };
    delete payload.skillId;
    delete payload.effectId;
    return this.skillEffectService.create(payload);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateSkillEffectDto): Promise<SkillEffect | null> {
    const payload: any = { ...data };
    if ((data as any).skillId) payload.skill = { id: Number((data as any).skillId) };
    if ((data as any).effectId) payload.effect = { id: Number((data as any).effectId) };
    delete payload.skillId;
    delete payload.effectId;
    return this.skillEffectService.update(Number(id), payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.skillEffectService.remove(Number(id));
  }
}
