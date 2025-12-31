import { Race } from '../Entities/race.entity';
import { RaceService } from '../Services/race.service';
export declare class RaceController {
    private readonly raceService;
    constructor(raceService: RaceService);
    findAll(): Promise<Race[]>;
    findOne(id: string): Promise<Race | null>;
    uploadIcon(file?: Express.Multer.File): Promise<{
        icon: string;
    }>;
    create(data: any): Promise<Race>;
    update(id: string, data: any): Promise<Race | null>;
    remove(id: string): Promise<void>;
}
