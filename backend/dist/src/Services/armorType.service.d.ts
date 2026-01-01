import { Repository } from 'typeorm';
import { ArmorType } from '../Entities/armorType.entity';
import { Race } from '../Entities/race.entity';
import { Sound } from '../Entities/sound.entity';
export declare class ArmorTypeService {
    private armorTypeRepository;
    private raceRepository;
    private soundRepository;
    constructor(armorTypeRepository: Repository<ArmorType>, raceRepository: Repository<Race>, soundRepository: Repository<Sound>);
    private normalize;
    private ensureSeeded;
    private resolveSounds;
    findAll(): Promise<ArmorType[]>;
    findOne(id: number): Promise<ArmorType | null>;
    create(data: Partial<ArmorType> & {
        soundIds?: any;
    }): Promise<ArmorType>;
    update(id: number, data: Partial<ArmorType> & {
        soundIds?: any;
    }): Promise<ArmorType | null>;
    resetToDefaults(): Promise<ArmorType[]>;
    remove(id: number): Promise<void>;
}
