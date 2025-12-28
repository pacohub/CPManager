import { Chapter } from './chapter';
import { MapItem } from './map';

export type EventType = 'MISSION' | 'CINEMATIC' | 'MOBA';
export type EventDifficulty = 'EASY' | 'NORMAL' | 'HARD';

export type MobaTeams = { teamAIds: number[]; teamBIds: number[] };

export interface EventItem {
	id: number;
	position?: number;
	name: string;
	description?: string;
	type: EventType;
	difficulty: EventDifficulty;
	file?: string;
	moba?: MobaTeams | null;

	// Backend devuelve relaciones eager
	chapter?: Chapter;
	map?: MapItem;

	// Opcionales por si alguna respuesta viene “plana”
	chapterId?: number;
	mapId?: number;
}

