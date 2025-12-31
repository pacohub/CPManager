import { Repository } from 'typeorm';
import { SoundType } from '../Entities/soundType.entity';
export declare class SoundTypeService {
    private soundTypeRepository;
    constructor(soundTypeRepository: Repository<SoundType>);
    findAll(): Promise<SoundType[]>;
    findOne(id: number): Promise<SoundType | null>;
    private normalize;
    create(data: Partial<SoundType>): Promise<SoundType>;
    update(id: number, data: Partial<SoundType>): Promise<SoundType | null>;
    remove(id: number): Promise<void>;
}
