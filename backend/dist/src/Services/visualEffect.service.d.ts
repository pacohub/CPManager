import { Repository } from 'typeorm';
import { VisualEffect } from '../Entities/visualEffect.entity';
export declare class VisualEffectService {
    private visualEffectRepository;
    constructor(visualEffectRepository: Repository<VisualEffect>);
    findAll(): Promise<VisualEffect[]>;
    findOne(id: number): Promise<VisualEffect | null>;
    create(data: Partial<VisualEffect>): Promise<VisualEffect>;
    update(id: number, data: Partial<VisualEffect>): Promise<VisualEffect | null>;
    remove(id: number): Promise<void>;
}
