import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Character } from './character.entity';
import { Class } from './class.entity';
import { Race } from './race.entity';

@Entity()
export class Animation {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 140, unique: true })
	name: string;

	@ManyToMany(() => Race, (race) => race.animations)
	races: Race[];

	@ManyToMany(() => Class, (klass) => klass.animations)
	classes: Class[];

	@ManyToMany(() => Character, (character) => character.animations)
	characters: Character[];
}
