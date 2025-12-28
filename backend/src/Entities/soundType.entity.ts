import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Sound } from './sound.entity';

@Entity()
export class SoundType {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 120, unique: true })
	name: string;

	@ManyToMany(() => Sound, (s) => s.types)
	sounds: Sound[];
}
