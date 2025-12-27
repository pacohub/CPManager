import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Map {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  file: string;
}
