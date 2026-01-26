import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Skill } from './skill.entity';
import { VisualEffect } from './visualEffect.entity';
import { TalentTreeTalent } from './talentTreeTalent.entity';

@Entity()
export class Talent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 140 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  icon: string;

  @Column({ type: 'text', nullable: true })
  file: string;

  @ManyToMany(() => Skill)
  @JoinTable({ name: 'talent_skills' })
  skills: Skill[];

  @ManyToMany(() => VisualEffect)
  @JoinTable({ name: 'talent_visuals' })
  visuals: VisualEffect[];

  @OneToMany(() => TalentTreeTalent, (ttt) => ttt.talent)
  treeEntries: TalentTreeTalent[];
}
