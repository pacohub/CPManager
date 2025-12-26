import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Region } from '../Entities/region.entity';
import { RegionService } from '../Services/region.service';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  async findAll(): Promise<Region[]> {
    return this.regionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Region | null> {
    return this.regionService.findOne(Number(id));
  }

  @Post()
  async create(@Body() data: any): Promise<Region> {
    return this.regionService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<Region | null> {
    return this.regionService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.regionService.remove(Number(id));
  }
}
