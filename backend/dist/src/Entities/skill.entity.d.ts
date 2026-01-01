import { VisualEffect } from './visualEffect.entity';
import { SkillEffect } from './skillEffect.entity';
export declare class Skill {
    id: number;
    name: string;
    description: string;
    icon: string;
    levels: number;
    file: string;
    casterVisual: VisualEffect | null;
    missileVisual: VisualEffect | null;
    targetVisual: VisualEffect | null;
    effects: SkillEffect[];
}
