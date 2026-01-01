import { SkillEffect } from '../Entities/skillEffect.entity';
import { SkillEffectService } from '../Services/skillEffect.service';
import { CreateSkillEffectDto } from '../Dto/create-skillEffect.dto';
import { UpdateSkillEffectDto } from '../Dto/update-skillEffect.dto';
export declare class SkillEffectController {
    private readonly skillEffectService;
    constructor(skillEffectService: SkillEffectService);
    findAll(): Promise<SkillEffect[]>;
    findOne(id: string): Promise<SkillEffect | null>;
    create(data: CreateSkillEffectDto): Promise<SkillEffect>;
    update(id: string, data: UpdateSkillEffectDto): Promise<SkillEffect | null>;
    remove(id: string): Promise<void>;
}
