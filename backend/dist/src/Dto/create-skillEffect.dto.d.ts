export declare class CreateSkillEffectDto {
    skillId: number;
    effectId: number;
    appliesTo: 'TARGET' | 'CASTER' | 'ZONAL_ALL' | 'ZONAL_ENEMY' | 'ZONAL_ALLY';
}
