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

  create(data: Partial<Saga>): Promise<Saga> {
    const saga = this.sagaRepository.create(data);
    return this.sagaRepository.save(saga);
  }

  async update(id: number, data: Partial<Saga>): Promise<Saga | null> {
    await this.sagaRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.sagaRepository.delete(id);
  }
}
