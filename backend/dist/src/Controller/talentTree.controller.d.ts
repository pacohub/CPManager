import { TalentTree } from '../Entities/talentTree.entity';
import { TalentTreeService } from '../Services/talentTree.service';
export declare class TalentTreeController {
    private readonly treeService;
    constructor(treeService: TalentTreeService);
    findAll(): Promise<TalentTree[]>;
    findOne(id: string): Promise<TalentTree | null>;
    create(data: any, files: {
        file?: Express.Multer.File[];
    }): Promise<TalentTree>;
    update(id: string, data: any, files: {
        file?: Express.Multer.File[];
    }): Promise<TalentTree | null>;
    remove(id: string): Promise<void>;
}
