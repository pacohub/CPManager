import { Talent } from '../Entities/talent.entity';
import { TalentService } from '../Services/talent.service';
export declare class TalentController {
    private readonly talentService;
    constructor(talentService: TalentService);
    findAll(): Promise<Talent[]>;
    findOne(id: string): Promise<Talent | null>;
    create(data: any): Promise<Talent>;
    uploadIcon(file?: Express.Multer.File): Promise<{
        icon: string;
    }>;
    update(id: string, data: any): Promise<Talent | null>;
    remove(id: string): Promise<void>;
}
