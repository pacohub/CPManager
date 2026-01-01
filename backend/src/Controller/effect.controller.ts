import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Effect } from '../Entities/effect.entity';
import { EffectService } from '../Services/effect.service';
import { CreateEffectDto } from '../Dto/create-effect.dto';
import { UpdateEffectDto } from '../Dto/update-effect.dto';

@Controller('effects')
export class EffectController {
  constructor(private readonly effectService: EffectService) {}

  @Get()
  async findAll(): Promise<Effect[]> {
    return this.effectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Effect | null> {
    return this.effectService.findOne(Number(id));
  }

  @Post()
  async create(@Body() data: CreateEffectDto): Promise<Effect> {
    const payload: any = { ...data };
    if ((data as any).visualEffectId) payload.visualEffect = { id: Number((data as any).visualEffectId) };
    delete payload.visualEffectId;
    return this.effectService.create(payload);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateEffectDto): Promise<Effect | null> {
    const payload: any = { ...data };
    if ((data as any).visualEffectId) payload.visualEffect = { id: Number((data as any).visualEffectId) };
    delete payload.visualEffectId;
    return this.effectService.update(Number(id), payload);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.effectService.remove(Number(id));
  }
}
