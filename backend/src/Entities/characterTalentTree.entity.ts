import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Character } from './character.entity';
import { TalentTree } from './talentTree.entity';

@Entity({ name: 'character_talent_tree' })
export class CharacterTalentTree {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Character, (c) => c.charTalentTreeFlags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'characterId' })
  character: Character;

  @Column({ type: 'int' })
  characterId: number;

  @ManyToOne(() => TalentTree, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'talentTreeId' })
  talentTree: TalentTree;

  @Column({ type: 'int' })
  talentTreeId: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;
}
