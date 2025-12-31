import { Animation } from './animation.entity';
import { Faction } from './faction.entity';
export declare class Class {
    id: number;
    name: string;
    icon: string;
    description: string;
    level: number;
    factions: Faction[];
    animations: Animation[];
}
