import { ArmorType } from './armorType.entity';
import { SoundType } from './soundType.entity';
export declare class Sound {
    id: number;
    name: string;
    file: string;
    types: SoundType[];
    armorTypes: ArmorType[];
}
