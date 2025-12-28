import { AnimationItem } from './animation';

export interface ClassItem {
	id: number;
	name: string;
	icon?: string;
	description?: string;
	level?: number;
	animations?: AnimationItem[];
}
