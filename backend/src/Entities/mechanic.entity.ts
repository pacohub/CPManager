import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Mechanic {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 120 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;
}
