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
  async saveOrder(ids: number[]): Promise<{ success: boolean }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('No saga IDs provided for ordering');
    }
    for (let i = 0; i < ids.length; i++) {
      await this.sagaRepository.update(ids[i], { order: i });
    }
    return { success: true };
  }
  constructor(
    @InjectRepository(Saga)
    private sagaRepository: Repository<Saga>,
  ) {}

  findAll(): Promise<Saga[]> {
    return this.sagaRepository.find();
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
    console.log('[BACKEND] [UPDATE SAGA] id:', id, 'body recibido:', data, 'body enviado:', safeData);
    await this.sagaRepository.update(id, safeData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.sagaRepository.delete(id);
  }
  async saveOrder(ids: number[]) {
  console.log('[BACKEND] [ORDER] Trying to save order. Received IDs:', ids);
    for (let i = 0; i < ids.length; i++) {
      try {
  const result = await this.sagaRepository.update(ids[i], { order: i });
  console.log(`[BACKEND] [ORDER] Updating saga id=${ids[i]} with order=${i}`, result);
      } catch (err) {
        console.error(`[BACKEND] [ORDER] Error actualizando saga id=${ids[i]}:`, err);
      }
    }
    // Probar si la columna existe realmente
    try {
      const test = await this.sagaRepository.query('PRAGMA table_info(saga)');
      console.log('[BACKEND] [ORDER] Estructura de la tabla saga:', test);
    } catch (err) {
      console.error('[BACKEND] [ORDER] Error consultando estructura de la tabla saga:', err);
    }
    return { success: true };
  }
}
