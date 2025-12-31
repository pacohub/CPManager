import { Repository } from 'typeorm';
import { Sound } from '../Entities/sound.entity';
import { SoundType } from '../Entities/soundType.entity';
export declare class SoundService {
    private soundRepository;
    private soundTypeRepository;
    constructor(soundRepository: Repository<Sound>, soundTypeRepository: Repository<SoundType>);
    findAll(): Promise<Sound[]>;
    findOne(id: number): Promise<Sound | null>;
    private normalize;
    private resolveTypes;
    create(data: Partial<Sound> & {
        typeIds?: any;
    }): Promise<Sound>;
    update(id: number, data: Partial<Sound> & {
        typeIds?: any;
    }): Promise<Sound | null>;
    remove(id: number): Promise<void>;
}
