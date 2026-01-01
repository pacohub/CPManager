import { Repository } from 'typeorm';
import { Saga } from '../Entities/saga.entity';
export declare class SagaService {
    private sagaRepository;
    constructor(sagaRepository: Repository<Saga>);
    findAll(): Promise<Saga[]>;
    findOne(id: number): Promise<Saga | null>;
    create(data: Partial<Saga>): Promise<Saga>;
    update(id: number, data: Partial<Saga>): Promise<Saga | null>;
    remove(id: number): Promise<void>;
    saveOrder(ids: number[]): Promise<{
        success: boolean;
    }>;
}
