import { ClassItem } from './class';

export interface CharacterItem {
	id: number;
	name: string;
	icon?: string;
	image?: string;
	model?: string;
	classId: number;
	class?: ClassItem;
	parentId?: number | null;
}
