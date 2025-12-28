import { Repository } from 'typeorm';
import { Faction } from '../Entities/faction.entity';
import { Profession } from '../Entities/profession.entity';
export declare class FactionService {
    private factionRepository;
    private professionRepository;
    constructor(factionRepository: Repository<Faction>, professionRepository: Repository<Profession>);
    findAll(): Promise<Faction[]>;
    findOne(id: number): Promise<Faction | null>;
    getProfessions(id: number): Promise<Profession[]>;
    setProfessionIds(id: number, professionIds: number[]): Promise<Faction>;
    create(data: Partial<Faction>): Promise<Faction>;
    update(id: number, data: Partial<Faction>): Promise<Faction | null>;
    remove(id: number): Promise<void>;
}
