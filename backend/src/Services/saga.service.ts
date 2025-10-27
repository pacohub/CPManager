import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Saga } from '../Entities/saga.entity';

@Injectable()
export class SagaService {
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
  const saga = this.sagaRepository.create({ ...data, orden: 5 });
  console.log('[DEBUG] Valor de saga.orden antes de guardar:', saga.orden);
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
    console.log('[BACKEND] [ORDER] Intentando guardar orden. IDs recibidos:', ids);
    for (let i = 0; i < ids.length; i++) {
      try {
        const result = await this.sagaRepository.update(ids[i], { orden: i });
        console.log(`[BACKEND] [ORDER] Actualizando saga id=${ids[i]} con orden=${i}`, result);
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
