import { Repository } from 'typeorm';
import { SoundType } from '../Entities/soundType.entity';
import { Sound } from '../Entities/sound.entity';
export declare class SoundTypeService {
    private soundTypeRepository;
    private soundRepository;
    constructor(soundTypeRepository: Repository<SoundType>, soundRepository: Repository<Sound>);
    findAll(): Promise<SoundType[]>;
    findOne(id: number): Promise<SoundType | null>;
    private normalize;
    create(data: Partial<SoundType>): Promise<SoundType>;
    update(id: number, data: Partial<SoundType>): Promise<SoundType | null>;
    getUsage(id: number): Promise<{
        count: number;
        soundIds: number[];
    }>;
    remove(id: number): Promise<{
        removedCount: number;
        removedSoundIds: number[];
    }>;
}
