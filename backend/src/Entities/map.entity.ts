import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Component } from './component.entity';

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

  @ManyToMany(() => Component, (component) => component.maps, { cascade: false })
  @JoinTable()
  components: Component[];
}
