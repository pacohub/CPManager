import { Repository } from 'typeorm';
import { Mechanic } from '../Entities/mechanic.entity';
export declare class MechanicService {
    private mechanicRepository;
    constructor(mechanicRepository: Repository<Mechanic>);
    private normalizeText;
    findAll(): Promise<Mechanic[]>;
    findOne(id: number): Promise<Mechanic | null>;
    create(data: any): Promise<Mechanic>;
    update(id: number, data: any): Promise<Mechanic | null>;
    remove(id: number): Promise<void>;
}
