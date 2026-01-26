import { AnimationItem } from './animation';

export interface ClassItem {
	id: number;
	name: string;
	icon?: string;
	description?: string;
	level?: number;
	animations?: AnimationItem[];
	// optional associated talent trees
	talentTrees?: { id: number; name: string }[];
}
