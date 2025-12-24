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

  @Put('order')
  async updateOrder(@Body() body: { ids: number[] }) {
    return this.sagaService.saveOrder(body.ids);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Saga>,
  ): Promise<Saga | null> {
    // Debug: mostrar el id recibido
    console.log('[BACKEND] [CONTROLLER] id recibido en update:', id);
    // Filtrar 'ids' si accidentalmente llega en el body
    const { ids, ...safeData } = data as any;
    return this.sagaService.update(Number(id), safeData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.sagaService.remove(Number(id));
  }
}
