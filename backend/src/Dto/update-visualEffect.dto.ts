import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateVisualEffectDto {
  @IsOptional()
  @IsString()
  @MaxLength(140)
  name?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  soundId?: number;
}
