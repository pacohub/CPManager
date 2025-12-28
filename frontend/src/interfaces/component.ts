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

export interface ComponentItem {
	id: number;
	name: string;
	description?: string;
	type: ComponentType | string;
	model?: string;
	image?: string;
}
