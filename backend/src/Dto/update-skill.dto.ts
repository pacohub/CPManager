import { IsInt, IsOptional, IsString, MaxLength, Min, IsBoolean } from 'class-validator';

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  @MaxLength(140)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  levels?: number;

  @IsOptional()
  @IsString()
  file?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  referencia?: string;

  @IsOptional()
  @IsInt()
  casterVisualId?: number;

  @IsOptional()
  @IsInt()
  missileVisualId?: number;

  @IsOptional()
  @IsInt()
  targetVisualId?: number;

  @IsOptional()
  @IsBoolean()
  passive?: boolean;
}
