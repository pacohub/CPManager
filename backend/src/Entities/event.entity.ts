import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chapter } from './chapter.entity';
import { Map } from './map.entity';

export enum EventType {
	MISSION = 'MISSION',
	CINEMATIC = 'CINEMATIC',
}

export enum EventDifficulty {
	EASY = 'EASY',
	NORMAL = 'NORMAL',
	HARD = 'HARD',
}

@Entity()
export class Event {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int', default: 0 })
	position: number;

	@Column({ length: 120 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ type: 'text' })
	type: EventType;

	@Column({ type: 'text' })
	difficulty: EventDifficulty;

	@Column({ nullable: true })
	file: string;

	@ManyToOne(() => Chapter, { eager: true, onDelete: 'CASCADE' })
	chapter: Chapter;

	@ManyToOne(() => Map, { eager: true, onDelete: 'CASCADE' })
	map: Map;
}

