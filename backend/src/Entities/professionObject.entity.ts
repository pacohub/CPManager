import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['professionId', 'objectId'], { unique: true })
export class ProfessionObject {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	professionId: number;

	@Column()
	objectId: number;

	@Column({ type: 'int', default: 1 })
	level: number;

	@Column({ type: 'int', default: 1 })
	quantity: number;

	@Column({ type: 'int', default: 0 })
	timeSeconds: number;
}
