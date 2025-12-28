import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
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
	@JoinTable()
	types: SoundType[];
}
