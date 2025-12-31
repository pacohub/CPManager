import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VisualEffect } from './visualEffect.entity';
import { SkillEffect } from './skillEffect.entity';

@Entity()
export class Effect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 140 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 60, nullable: true })
  type: string;

  @Column({ type: 'text', nullable: true })
  benefit: string;

  @Column({ type: 'text', nullable: true })
  precondition: string;

  @Column({ type: 'text', nullable: true })
  file: string;

  @ManyToOne(() => VisualEffect, { eager: true, nullable: true, onDelete: 'SET NULL' })
  visualEffect: VisualEffect | null;

  @OneToMany(() => SkillEffect, (se) => se.effect)
  skillAssociations: SkillEffect[];
}
