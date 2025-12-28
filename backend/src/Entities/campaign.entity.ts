import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GameObject } from './gameObject.entity';

@Entity()
export class Campaign {
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

  @Column()
  sagaId: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToMany(() => GameObject, (o) => o.campaigns)
  objects: GameObject[];
}
