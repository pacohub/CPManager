import { VisualEffect } from './visualEffect.entity';
import { SkillEffect } from './skillEffect.entity';
import { Race } from './race.entity';
export declare class Skill {
    id: number;
    name: string;
    description: string;
    icon: string;
    levels: number;
    file: string;
    referencia: string;
    casterVisual: VisualEffect | null;
    missileVisual: VisualEffect | null;
    targetVisual: VisualEffect | null;
    effects: SkillEffect[];
    passive: boolean;
    races: Race[];
}
