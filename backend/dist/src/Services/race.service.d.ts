import { Repository } from 'typeorm';
import { Animation } from '../Entities/animation.entity';
import { ArmorType } from '../Entities/armorType.entity';
import { Race } from '../Entities/race.entity';
import { Sound } from '../Entities/sound.entity';
export declare class RaceService {
    private raceRepository;
    private armorTypeRepository;
    private soundRepository;
    private animationRepository;
    constructor(raceRepository: Repository<Race>, armorTypeRepository: Repository<ArmorType>, soundRepository: Repository<Sound>, animationRepository: Repository<Animation>);
    private resolveArmorTypeId;
    private ensureAnimationsExistByName;
    private resolveDefaultAnimationsForRace;
    findAll(): Promise<Race[]>;
    findOne(id: number): Promise<Race | null>;
    private coerceIdArray;
    private normalize;
    private validateEnums;
    private coerceNumbers;
    private ensureSoundExists;
    create(data: Partial<Race>): Promise<Race>;
    update(id: number, data: Partial<Race>): Promise<Race | null>;
    remove(id: number): Promise<void>;
}
