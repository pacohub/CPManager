import { Faction } from '../Entities/faction.entity';
import { FactionService } from '../Services/faction.service';
export declare class FactionController {
    private readonly factionService;
    constructor(factionService: FactionService);
    findAll(): Promise<Faction[]>;
    getProfessions(id: string): Promise<any[]>;
    setProfessions(id: string, body: any): Promise<Faction>;
    getClasses(id: string): Promise<any[]>;
    setClasses(id: string, body: any): Promise<Faction>;
    findOne(id: string): Promise<Faction | null>;
    create(data: any, files: {
        crestImage?: Express.Multer.File[];
        iconImage?: Express.Multer.File[];
    }): Promise<Faction>;
    update(id: string, data: any, files: {
        crestImage?: Express.Multer.File[];
        iconImage?: Express.Multer.File[];
    }): Promise<Faction | null>;
    remove(id: string): Promise<void>;
}
