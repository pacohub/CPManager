import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Faction } from './faction.entity';

@Entity()
export class Profession {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 120, unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ nullable: true })
	link: string;

	@ManyToMany(() => Faction, (f) => f.professions)
	factions: Faction[];
}
