import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chapter } from './chapter.entity';
import { Map } from './map.entity';

export enum EventType {
	EVENT = 'EVENT',
	MISSION = 'MISSION',
	SECONDARY_MISSION = 'SECONDARY_MISSION',
	DAILY_MISSION = 'DAILY_MISSION',
	WEEKLY_MISSION = 'WEEKLY_MISSION',
	CINEMATIC = 'CINEMATIC',
	MOBA = 'MOBA',
}

export enum EventDifficulty {
	EASY = 'EASY',
	NORMAL = 'NORMAL',
	HARD = 'HARD',
}

export type MobaTeam = { name: string; factionIds: number[] };
export type MobaConfig = { teams: MobaTeam[] };

export type DialogueLine = { speaker?: string; text: string };
export type DialogueConfig = { lines: DialogueLine[] };

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

	@Column({ type: 'simple-json', nullable: true })
	moba: MobaConfig | null;

	@Column({ type: 'simple-json', nullable: true })
	dialogue: DialogueConfig | null;

	@ManyToOne(() => Chapter, { eager: true, onDelete: 'CASCADE' })
	chapter: Chapter;

	@ManyToOne(() => Map, { eager: true, onDelete: 'CASCADE' })
	map: Map;
}

