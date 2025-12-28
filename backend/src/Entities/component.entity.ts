import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Map } from './map.entity';

export const COMPONENT_TYPES = [
	'puentes y rampas',
	'cinemático (efectos)',
	'efecto en terreno o paredes',
	'entorno (sin collider)',
	'adorno (con collider)',
	'estructura',
	'árboles y destructibles',
	'agua',
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

@Entity()
export class Component {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 140, unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ length: 80 })
	type: string;

	@Column({ type: 'text', nullable: true })
	model: string;

	@Column({ nullable: true })
	image: string;

	@ManyToMany(() => Map, (map) => map.components)
	maps: Map[];
}
