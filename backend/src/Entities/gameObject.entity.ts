import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Campaign } from './campaign.entity';

@Entity()
export class GameObject {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 120, unique: true })
	name: string;

	@Column({ nullable: true })
	icon: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ nullable: true })
	fileLink: string;

	@ManyToMany(() => Campaign, (c) => c.objects)
	campaigns: Campaign[];
}
