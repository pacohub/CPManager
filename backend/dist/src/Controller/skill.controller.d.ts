import { Skill } from '../Entities/skill.entity';
import { SkillService } from '../Services/skill.service';
import { CreateSkillDto } from '../Dto/create-skill.dto';
import { UpdateSkillDto } from '../Dto/update-skill.dto';
export declare class SkillController {
    private readonly skillService;
    constructor(skillService: SkillService);
    findAll(): Promise<Skill[]>;
    findOne(id: string): Promise<Skill | null>;
    create(data: CreateSkillDto): Promise<Skill>;
    functionFileName(file: Express.Multer.File): string;
    uploadIcon(file?: Express.Multer.File): Promise<{
        icon: string;
    }>;
    update(id: string, data: UpdateSkillDto): Promise<Skill | null>;
    remove(id: string): Promise<void>;
    importBlizzard(body?: {
        region?: string;
        locale?: string;
        limit?: number;
    }): Promise<any>;
}
