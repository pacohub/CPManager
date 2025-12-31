import { SagaService } from '../Services/saga.service';
import { Saga } from '../Entities/saga.entity';
export declare class SagaController {
    private readonly sagaService;
    constructor(sagaService: SagaService);
    findAll(): Promise<Saga[]>;
    findOne(id: string): Promise<Saga | null>;
    create(data: Partial<Saga>): Promise<Saga>;
    updateOrder(body: {
        ids: number[];
    }): Promise<{
        success: boolean;
    }>;
    update(id: string, data: Partial<Saga>): Promise<Saga | null>;
    remove(id: string): Promise<void>;
}
