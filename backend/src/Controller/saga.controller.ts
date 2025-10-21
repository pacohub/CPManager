import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SagaService } from '../Services/saga.service';
import { Saga } from '../Entities/saga.entity';

@Controller('sagas')
export class SagaController {
  constructor(private readonly sagaService: SagaService) {}

  @Get()
  findAll(): Promise<Saga[]> {
    return this.sagaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Saga | null> {
    return this.sagaService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Partial<Saga>): Promise<Saga> {
    return this.sagaService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Saga>,
  ): Promise<Saga | null> {
    return this.sagaService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.sagaService.remove(Number(id));
  }
}
