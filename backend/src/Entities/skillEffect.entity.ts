import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Skill } from './skill.entity';
import { Effect } from './effect.entity';

export enum AppliesTo {
  TARGET = 'TARGET',
  CASTER = 'CASTER',
  ZONAL_ALL = 'ZONAL_ALL',
  ZONAL_ENEMY = 'ZONAL_ENEMY',
  ZONAL_ALLY = 'ZONAL_ALLY',
}

@Entity({ name: 'skill_effects' })
export class SkillEffect {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Skill, { eager: true, onDelete: 'CASCADE' })
  skill: Skill;

  @ManyToOne(() => Effect, { eager: true, onDelete: 'CASCADE' })
  effect: Effect;

  @Column({ type: 'text', default: AppliesTo.TARGET })
  appliesTo: AppliesTo;
}
