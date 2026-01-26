import { Skill } from './skill.entity';
import { VisualEffect } from './visualEffect.entity';
import { TalentTreeTalent } from './talentTreeTalent.entity';
export declare class Talent {
    id: number;
    name: string;
    description: string;
    icon: string;
    file: string;
    skills: Skill[];
    visuals: VisualEffect[];
    treeEntries: TalentTreeTalent[];
}
