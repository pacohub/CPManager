import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'defense_type' })
export class DefenseType {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 120, unique: true })
	name: string;
}
