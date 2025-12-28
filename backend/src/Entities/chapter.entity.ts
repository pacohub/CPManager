import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany } from 'typeorm';
import { Resource } from './resource.entity';

export enum ChapterSpecialType {
  CREDITS = 'CREDITS',
}

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  campaignId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  file: string;

	@Column({ type: 'text', nullable: true })
	specialType: ChapterSpecialType | null;

  @ManyToMany(() => Resource, (resource) => resource.chapters, { cascade: false })
  @JoinTable()
  resources: Resource[];
}
