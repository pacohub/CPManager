import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
