import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Region } from './region.entity';

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

  @ManyToMany(() => Region, (region) => region.maps, { cascade: false })
  @JoinTable()
  regions: Region[];
}
