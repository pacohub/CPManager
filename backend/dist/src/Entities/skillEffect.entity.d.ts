import { Skill } from './skill.entity';
import { Effect } from './effect.entity';
export declare enum AppliesTo {
    TARGET = "TARGET",
    CASTER = "CASTER",
    ZONAL_ALL = "ZONAL_ALL",
    ZONAL_ENEMY = "ZONAL_ENEMY",
    ZONAL_ALLY = "ZONAL_ALLY"
}
export declare class SkillEffect {
    id: number;
    skill: Skill;
    effect: Effect;
    appliesTo: AppliesTo;
}
