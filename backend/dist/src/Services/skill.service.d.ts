import { Repository } from 'typeorm';
import { Skill } from '../Entities/skill.entity';
export declare class SkillService {
    private skillRepository;
    constructor(skillRepository: Repository<Skill>);
    findAll(): Promise<Skill[]>;
    findOne(id: number): Promise<Skill | null>;
    create(data: Partial<Skill>): Promise<Skill>;
    update(id: number, data: Partial<Skill>): Promise<Skill | null>;
    remove(id: number): Promise<void>;
    importFromBlizzard(options?: {
        region?: string;
        locale?: string;
        limit?: number;
    }): Promise<{
        inserted: number;
        skipped: number;
    }>;
}
