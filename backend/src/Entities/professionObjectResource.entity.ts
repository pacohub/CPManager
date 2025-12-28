import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['professionId', 'objectId', 'resourceId'], { unique: true })
export class ProfessionObjectResource {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	professionId: number;

	@Column()
	objectId: number;

	@Column()
	resourceId: number;

	@Column({ type: 'int', default: 1 })
	quantity: number;
}
