import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Animation } from './animation.entity';
import { Faction } from './faction.entity';

@Entity()
export class Class {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 120, unique: true })
	name: string;

	@Column({ nullable: true })
	icon: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ type: 'int', default: 1 })
	level: number;

	@ManyToMany(() => Faction, (f) => f.classes)
	factions: Faction[];

	@ManyToMany(() => Animation, (animation) => animation.classes)
	@JoinTable({ name: 'class_animations' })
	animations: Animation[];
}
