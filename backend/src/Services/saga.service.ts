import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Saga } from '../Entities/saga.entity';

@Injectable()
export class SagaService {
  /**
   * Actualiza el campo 'order' de las sagas según el array de IDs recibido.
   * @param ids Array de IDs de sagas en el nuevo orden
   */

  constructor(
    @InjectRepository(Saga)
    private sagaRepository: Repository<Saga>,
  ) {}

  findAll(): Promise<Saga[]> {
    return this.sagaRepository.find({ order: { order: 'ASC' } });
  }

  findOne(id: number): Promise<Saga | null> {
    return this.sagaRepository.findOneBy({ id });
  }

  async create(data: Partial<Saga>): Promise<Saga> {
    // Get current max value of 'order'
    const maxOrderResult = await this.sagaRepository
      .createQueryBuilder('saga')
      .select('MAX(saga.order)', 'max')
      .getRawOne();
    const maxOrder = maxOrderResult?.max ?? 0;
    const saga = this.sagaRepository.create({
      ...data,
      order: data.order ?? (Number(maxOrder) + 1),
    });
    console.log('[DEBUG] Saga order before save:', saga.order);
    return await this.sagaRepository.save(saga);
  }

  async update(id: number, data: Partial<Saga>): Promise<Saga | null> {
    // Filtrar 'ids' si accidentalmente llega en el body
    const { ids, ...safeData } = data as any;
    if (!id || isNaN(id)) {
      console.error('[BACKEND] [UPDATE SAGA] id inválido:', id);
      throw new Error('ID inválido para actualizar saga');
    }
    if (!safeData || Object.keys(safeData).length === 0) {
      console.error('[BACKEND] [UPDATE SAGA] body vacío:', safeData);
      throw new Error('Datos vacíos para actualizar saga');
    }
    console.log('[BACKEND] [UPDATE SAGA] id:', id, 'body recibido:', data, 'body enviado:', safeData);
    await this.sagaRepository.update(id, safeData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.sagaRepository.delete(id);
  }

    async saveOrder(ids: number[]): Promise<{ success: boolean }> {
      try {
        if (!Array.isArray(ids) || ids.length === 0) {
          throw new Error('No saga IDs provided for ordering');
        }
        console.log('[BACKEND] [saveOrder] Recibido ids:', ids);
        for (let i = 0; i < ids.length; i++) {
          const result = await this.sagaRepository.update(ids[i], { order: i });
          console.log(`[BACKEND] [saveOrder] Actualizando saga id=${ids[i]} a order=${i}. Resultado:`, result);
        }
        return { success: true };
      } catch (error) {
        console.error('[BACKEND] [saveOrder] Error:', error);
        throw error;
      }
    }
}
