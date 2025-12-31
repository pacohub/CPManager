import { Chapter } from './chapter';
import { MapItem } from './map';

export type EventType = 'EVENT' | 'MISSION' | 'SECONDARY_MISSION' | 'DAILY_MISSION' | 'WEEKLY_MISSION' | 'CINEMATIC' | 'MOBA';
export type EventDifficulty = 'EASY' | 'NORMAL' | 'HARD';

export type MobaTeamsLegacy = { teamAIds: number[]; teamBIds: number[] };
export type MobaTeam = { name: string; factionIds: number[] };
export type MobaConfig = { teams: MobaTeam[] };
export type MobaTeams = MobaTeamsLegacy | MobaConfig;

export type DialogueLine = { speaker?: string; text: string };
export type DialogueConfig = { lines: DialogueLine[] };

export interface EventItem {
	id: number;
	position?: number;
	name: string;
	description?: string;
	type: EventType;
	difficulty: EventDifficulty;
	file?: string;
	moba?: MobaTeams | null;
	dialogue?: DialogueConfig | null;

	// Backend devuelve relaciones eager
	chapter?: Chapter;
	map?: MapItem;

	// Opcionales por si alguna respuesta viene “plana”
	chapterId?: number;
	mapId?: number;
}

