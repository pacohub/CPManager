import { SoundItem } from './sound';

export interface ArmorTypeItem {
	id: number;
	name: string;
	sounds?: SoundItem[];
}
