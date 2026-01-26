import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TalentTreeTalent } from './talentTreeTalent.entity';
import { TalentTreeLink } from './talentTreeLink.entity';

@Entity()
export class TalentTree {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 140 })
  name: string;

  @Column({ type: 'text', nullable: true })
  file: string;

  @OneToMany(() => TalentTreeTalent, (ttt) => ttt.talentTree, { cascade: true, eager: true })
  entries: TalentTreeTalent[];

  @OneToMany(() => TalentTreeLink, (l) => l.talentTree, { cascade: true, eager: true })
  links: TalentTreeLink[];
}
