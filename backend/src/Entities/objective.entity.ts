import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event, EventDifficulty } from './event.entity';
import { Mechanic } from './mechanic.entity';

@Entity()
export class Objective {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int', default: 0 })
	position: number;

	@Column({ length: 160 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ type: 'text', nullable: true })
	detailedDescription: string;

	@Column({ type: 'text', default: EventDifficulty.NORMAL })
	difficulty: EventDifficulty;

	@Column({ type: 'int', default: 0 })
	initialValue: number;

	@Column({ type: 'int', default: 0 })
	difficultyIncrement: number;

	@ManyToOne(() => Event, { eager: true, onDelete: 'CASCADE' })
	event: Event;

	@ManyToOne(() => Mechanic, { eager: true, onDelete: 'CASCADE' })
	mechanic: Mechanic;
}
