import { Repository } from 'typeorm';
import { Effect } from '../Entities/effect.entity';
export declare class EffectService {
    private effectRepository;
    constructor(effectRepository: Repository<Effect>);
    findAll(): Promise<Effect[]>;
    findOne(id: number): Promise<Effect | null>;
    create(data: Partial<Effect>): Promise<Effect>;
    update(id: number, data: Partial<Effect>): Promise<Effect | null>;
    remove(id: number): Promise<void>;
}
