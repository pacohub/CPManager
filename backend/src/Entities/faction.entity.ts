import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Profession } from './profession.entity';
import { Class } from './class.entity';

@Entity()
export class Faction {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 120 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ nullable: true })
	crestImage: string;

	@Column({ nullable: true })
	iconImage: string;

	@Column({ nullable: true })
	primaryColor: string;

	@Column({ nullable: true })
	secondaryColor: string;

	@Column({ nullable: true })
	tertiaryColor: string;

	@Column({ nullable: true })
	file: string;

	@ManyToMany(() => Profession, (p) => p.factions, { cascade: false })
	@JoinTable()
	professions: Profession[];

	@ManyToMany(() => Class, (c) => c.factions, { cascade: false })
	@JoinTable()
	classes: Class[];
}
