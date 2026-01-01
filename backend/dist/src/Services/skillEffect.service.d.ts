import { Repository } from 'typeorm';
import { SkillEffect } from '../Entities/skillEffect.entity';
export declare class SkillEffectService {
    private skillEffectRepository;
    constructor(skillEffectRepository: Repository<SkillEffect>);
    findAll(): Promise<SkillEffect[]>;
    findOne(id: number): Promise<SkillEffect | null>;
    create(data: Partial<SkillEffect>): Promise<SkillEffect>;
    update(id: number, data: Partial<SkillEffect>): Promise<SkillEffect | null>;
    remove(id: number): Promise<void>;
}
