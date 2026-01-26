import { Character } from './character.entity';
import { TalentTree } from './talentTree.entity';
export declare class CharacterTalentTree {
    id: number;
    character: Character;
    characterId: number;
    talentTree: TalentTree;
    talentTreeId: number;
    enabled: boolean;
}
