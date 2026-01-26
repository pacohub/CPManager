import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TalentTree } from './talentTree.entity';

@Entity({ name: 'talent_tree_links' })
export class TalentTreeLink {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TalentTree, (tt) => tt.links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'talentTreeId' })
  talentTree: TalentTree;

  @Column({ type: 'integer' })
  talentTreeId: number;

  @Column({ type: 'integer' })
  fromX: number;

  @Column({ type: 'integer' })
  fromY: number;

  @Column({ type: 'integer' })
  toX: number;

  @Column({ type: 'integer' })
  toY: number;
}
