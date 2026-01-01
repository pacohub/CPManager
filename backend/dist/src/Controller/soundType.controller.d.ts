import { SoundType } from '../Entities/soundType.entity';
import { SoundTypeService } from '../Services/soundType.service';
export declare class SoundTypeController {
    private readonly soundTypeService;
    constructor(soundTypeService: SoundTypeService);
    findAll(): Promise<SoundType[]>;
    findOne(id: string): Promise<SoundType | null>;
    create(data: any): Promise<SoundType>;
    update(id: string, data: any): Promise<SoundType | null>;
    remove(id: string): Promise<void>;
}
