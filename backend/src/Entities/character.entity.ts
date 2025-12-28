import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Animation } from './animation.entity';
import { Class } from './class.entity';
import { Race } from './race.entity';

@Entity()
export class Character {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 120 })
	name: string;

	@Column({ type: 'text', nullable: true })
	icon: string | null;

	@Column({ type: 'text', nullable: true })
	image: string | null;

	@Column({ type: 'text', nullable: true })
	model: string | null;

	@ManyToOne(() => Character, (c) => c.children, { nullable: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'parentId' })
	parent: Character | null;

	@Column({ type: 'int', nullable: true })
	parentId: number | null;

	@ManyToOne(() => Class, { nullable: false, cascade: false })
	@JoinColumn({ name: 'classId' })
	class: Class;

	@Column({ type: 'int' })
	classId: number;

	@ManyToOne(() => Race, { nullable: true, cascade: false, eager: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'raceId' })
	race?: Race | null;

	@Column({ type: 'int', nullable: true })
	raceId: number | null;

	@OneToMany(() => Character, (c) => c.parent)
	children: Character[];

	@ManyToMany(() => Animation, (animation) => animation.characters)
	@JoinTable({ name: 'character_animations' })
	animations: Animation[];
}
