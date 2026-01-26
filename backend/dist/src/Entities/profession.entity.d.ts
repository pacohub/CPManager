import { Faction } from './faction.entity';
import { TalentTree } from './talentTree.entity';
export declare class Profession {
    id: number;
    name: string;
    description: string;
    link: string;
    factions: Faction[];
    talentTrees: TalentTree[];
}
