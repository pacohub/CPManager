import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Sound } from './sound.entity';

@Entity()
export class VisualEffect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 140 })
  name: string;

  @Column({ type: 'text', nullable: true })
  model: string;

  @ManyToOne(() => Sound, { eager: true, nullable: true, onDelete: 'SET NULL' })
  sound: Sound | null;
}
