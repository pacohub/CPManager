import { ClassItem } from './class';
import { RaceItem } from './race';

export interface CharacterItem {
	id: number;
	name: string;
	icon?: string;
	image?: string;
	model?: string;
	classId: number;
	class?: ClassItem;
	raceId?: number | null;
	race?: RaceItem | null;
	parentId?: number | null;
}
