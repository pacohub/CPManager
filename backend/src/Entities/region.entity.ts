import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Map } from './map.entity';

@Entity()
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  link: string;

  @ManyToMany(() => Map, (map) => map.regions)
  maps: Map[];
}
