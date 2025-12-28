import { SoundTypeItem } from './soundType';

export interface SoundItem {
	id: number;
	name: string;
	file?: string;
	types?: SoundTypeItem[];
}
