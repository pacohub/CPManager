import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Saga {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  order: number;
}
