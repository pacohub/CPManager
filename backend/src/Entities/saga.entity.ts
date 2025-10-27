import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Saga {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'int', default: 0 })
  orden: number;
}
