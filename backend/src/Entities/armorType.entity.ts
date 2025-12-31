import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Sound } from './sound.entity';

@Entity({ name: 'armor_type' })
export class ArmorType {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 120, unique: true })
	name: string;

	// Sonidos de golpes/impactos para esta armadura
	@ManyToMany(() => Sound, (s) => (s as any).armorTypes)
	@JoinTable({ name: 'armor_type_sounds' })
	sounds: Sound[];
}
