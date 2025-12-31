import { Repository } from 'typeorm';
import { Faction } from '../Entities/faction.entity';
import { Profession } from '../Entities/profession.entity';
import { Class } from '../Entities/class.entity';
export declare class FactionService {
    private factionRepository;
    private professionRepository;
    private classRepository;
    constructor(factionRepository: Repository<Faction>, professionRepository: Repository<Profession>, classRepository: Repository<Class>);
    findAll(): Promise<Faction[]>;
    findOne(id: number): Promise<Faction | null>;
    getProfessions(id: number): Promise<Profession[]>;
    setProfessionIds(id: number, professionIds: number[]): Promise<Faction>;
    getClasses(id: number): Promise<Class[]>;
    setClassIds(id: number, classIds: number[]): Promise<Faction>;
    create(data: Partial<Faction>): Promise<Faction>;
    update(id: number, data: Partial<Faction>): Promise<Faction | null>;
    remove(id: number): Promise<void>;
}
