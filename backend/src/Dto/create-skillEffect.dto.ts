import { IsIn, IsInt, IsNotEmpty } from 'class-validator';

export class CreateSkillEffectDto {
  @IsInt()
  skillId!: number;

  @IsInt()
  effectId!: number;

  @IsNotEmpty()
  @IsIn(['TARGET', 'CASTER', 'ZONAL_ALL', 'ZONAL_ENEMY', 'ZONAL_ALLY'])
  appliesTo!: 'TARGET' | 'CASTER' | 'ZONAL_ALL' | 'ZONAL_ENEMY' | 'ZONAL_ALLY';
}
