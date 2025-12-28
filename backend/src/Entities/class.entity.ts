import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
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
}
