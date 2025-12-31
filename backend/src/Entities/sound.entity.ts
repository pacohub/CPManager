import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ArmorType } from './armorType.entity';
import { SoundType } from './soundType.entity';

@Entity()
export class Sound {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 140, unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	file: string;

	@ManyToMany(() => SoundType, (t) => t.sounds, { eager: true })
	@JoinTable({ name: 'sound_types' })
	types: SoundType[];

	@ManyToMany(() => ArmorType, (a) => a.sounds)
	armorTypes: ArmorType[];
}
