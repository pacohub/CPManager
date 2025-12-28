import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chapter } from './chapter.entity';
import { ResourceType } from './resourceType.entity';

@Entity()
export class Resource {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 140, unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ nullable: true })
	icon: string;

	@Column({ type: 'text', nullable: true })
	fileLink: string;

	@ManyToOne(() => ResourceType, { eager: true, onDelete: 'RESTRICT' })
	resourceType: ResourceType;

	@ManyToMany(() => Chapter, (chapter) => chapter.resources)
	chapters: Chapter[];
}
