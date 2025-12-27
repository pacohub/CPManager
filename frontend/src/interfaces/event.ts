import { Chapter } from './chapter';
import { MapItem } from './map';

export type EventType = 'MISSION' | 'CINEMATIC';
export type EventDifficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface EventItem {
	id: number;
	position?: number;
	name: string;
	description?: string;
	type: EventType;
	difficulty: EventDifficulty;
	file?: string;

	// Backend devuelve relaciones eager
	chapter?: Chapter;
	map?: MapItem;

	// Opcionales por si alguna respuesta viene “plana”
	chapterId?: number;
	mapId?: number;
}

