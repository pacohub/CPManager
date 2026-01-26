import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TalentTree } from './talentTree.entity';
import { Talent } from './talent.entity';

@Entity({ name: 'talent_tree_talents' })
export class TalentTreeTalent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TalentTree, (tt) => tt.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'talentTreeId' })
  talentTree: TalentTree;

  @Column({ type: 'integer' })
  talentTreeId: number;

  @ManyToOne(() => Talent, (t) => t.treeEntries, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'talentId' })
  talent: Talent;

  @Column({ type: 'integer' })
  talentId: number;

  @Column({ type: 'integer', default: 0 })
  posX: number;

  @Column({ type: 'integer', default: 0 })
  posY: number;

  @Column({ type: 'integer', default: 0 })
  order: number;
}
