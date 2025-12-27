import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['chapterId', 'factionId'], { unique: true })
export class ChapterFaction {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	chapterId: number;

	@Column()
	factionId: number;

	@Column({ length: 120 })
	groupName: string;

	@Column({ type: 'int', default: 0 })
	order: number;

	@Column({ type: 'boolean', default: false })
	isPlayable: boolean;

	@Column({ type: 'text', nullable: true })
	colorOverride: string | null;
}
