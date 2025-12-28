import { SoundItem } from './sound';
import { AnimationItem } from './animation';

export interface RaceItem {
	id: number;
	name: string;
	icon?: string;
	deathType?: string;
	baseDefense: number;
	movementSpeed: number;
	movementType?: string;
	movementSoundId?: number | null;
	movementSound?: SoundItem | null;
	lifeRegen: number;
	baseLife: number;
	baseMana: number;
	baseManaRegen: number;
	initialMana: number;
	transportSize: number;
	armorType?: string;
	animations?: AnimationItem[];
}
