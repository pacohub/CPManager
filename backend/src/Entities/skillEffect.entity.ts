import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Skill } from './skill.entity';
import { Effect } from './effect.entity';

export enum SkillEffectSelection {
  CASTER = 'CASTER',
  TARGET = 'TARGET',
}

@Entity()
export class SkillEffect {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Skill, (s) => s.effects, { onDelete: 'CASCADE' })
  skill: Skill;

  @ManyToOne(() => Effect, (e) => e.skillAssociations, { eager: true, onDelete: 'CASCADE' })
  effect: Effect;

  @Column({ type: 'text' })
  selection: SkillEffectSelection;
}
