import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ResourceType {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 100, unique: true })
	name: string;
}
