import { IsIn, IsInt, IsOptional } from 'class-validator';

export class UpdateSkillEffectDto {
  @IsOptional()
  @IsInt()
  skillId?: number;

  @IsOptional()
  @IsInt()
  effectId?: number;

  @IsOptional()
  @IsIn(['TARGET', 'CASTER', 'ZONAL_ALL', 'ZONAL_ENEMY', 'ZONAL_ALLY'])
  appliesTo?: 'TARGET' | 'CASTER' | 'ZONAL_ALL' | 'ZONAL_ENEMY' | 'ZONAL_ALLY';
}
