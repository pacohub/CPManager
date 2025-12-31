import { Repository } from 'typeorm';
import { Profession } from '../Entities/profession.entity';
export declare class ProfessionService {
    private professionRepository;
    constructor(professionRepository: Repository<Profession>);
    private normalizeText;
    findAll(): Promise<Profession[]>;
    findOne(id: number): Promise<Profession | null>;
    create(data: any): Promise<Profession>;
    update(id: number, data: any): Promise<Profession | null>;
    remove(id: number): Promise<void>;
}
