import { SoundItem } from './sound';
import { AnimationItem } from './animation';
import { ArmorTypeItem } from './armorType';

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
	// Legacy string field (kept for backward compatibility)
	armorType?: string;
	// New relation field
	armorTypeId?: number | null;
	armorTypeEntity?: ArmorTypeItem | null;
	animations?: AnimationItem[];
}
