import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VisualEffect } from './visualEffect.entity';
import { SkillEffect } from './skillEffect.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 140 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  icon: string;

  @Column({ type: 'int', default: 1 })
  levels: number;

  @Column({ type: 'text', nullable: true })
  file: string;

  @ManyToOne(() => VisualEffect, { eager: true, nullable: true, onDelete: 'SET NULL' })
  casterVisual: VisualEffect | null;

  @ManyToOne(() => VisualEffect, { eager: true, nullable: true, onDelete: 'SET NULL' })
  missileVisual: VisualEffect | null;

  @ManyToOne(() => VisualEffect, { eager: true, nullable: true, onDelete: 'SET NULL' })
  targetVisual: VisualEffect | null;

  @OneToMany(() => SkillEffect, (se) => se.skill)
  effects: SkillEffect[];
}
