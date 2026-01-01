import { Sound } from '../Entities/sound.entity';
import { SoundService } from '../Services/sound.service';
export declare class SoundController {
    private readonly soundService;
    constructor(soundService: SoundService);
    findAll(): Promise<Sound[]>;
    findOne(id: string): Promise<Sound | null>;
    create(data: any, files: {
        file?: Express.Multer.File[];
    }): Promise<Sound>;
    update(id: string, data: any, files: {
        file?: Express.Multer.File[];
    }): Promise<Sound | null>;
    remove(id: string): Promise<void>;
}
