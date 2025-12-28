import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Animation } from './animation.entity';
import { Sound } from './sound.entity';

export const RACE_DEATH_TYPES = [
	'no revive, no se pudre',
	'revive, no se pudre',
	'revive, se pudre',
	'no revive, se pudre',
] as const;

export type RaceDeathType = (typeof RACE_DEATH_TYPES)[number];

export const RACE_MOVEMENT_TYPES = [
	'ninguno',
	'a pie',
	'jinete',
	'vuela',
	'levita',
	'flota',
	'anfibio',
] as const;

export type RaceMovementType = (typeof RACE_MOVEMENT_TYPES)[number];

export const RACE_ARMOR_TYPES = ['carne', 'etérea', 'metal', 'piedra', 'madera'] as const;
export type RaceArmorType = (typeof RACE_ARMOR_TYPES)[number];

@Entity()
export class Race {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 140, unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	icon: string;

	@Column({ type: 'text', nullable: true })
	deathType: string;

	@Column({ type: 'integer', default: 0 })
	baseDefense: number;

	@Column({ type: 'integer', default: 0 })
	movementSpeed: number;

	@Column({ type: 'text', nullable: true })
	movementType: string;

	@Column({ type: 'text', nullable: true })
	attack1: string;

	@Column({ type: 'text', nullable: true })
	attack2: string;

	@Column({ type: 'text', nullable: true })
	defenseType: string;

	@ManyToOne(() => Sound, { nullable: true, eager: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'movementSoundId' })
	movementSound?: Sound | null;

	@Column({ type: 'integer', nullable: true })
	movementSoundId?: number | null;

	@Column({ type: 'real', default: 0 })
	lifeRegen: number;

	@Column({ type: 'integer', default: 0 })
	baseLife: number;

	@Column({ type: 'integer', default: 0 })
	baseMana: number;

	@Column({ type: 'real', default: 0 })
	baseManaRegen: number;

	@Column({ type: 'integer', default: 0 })
	initialMana: number;

	@Column({ type: 'integer', default: 0 })
	transportSize: number;

	@Column({ type: 'text', nullable: true })
	armorType: string;

	@ManyToMany(() => Animation, (animation) => animation.races)
	@JoinTable({ name: 'race_animations' })
	animations: Animation[];
}
