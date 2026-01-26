import { TalentTree } from './talentTree.entity';
import { Talent } from './talent.entity';
export declare class TalentTreeTalent {
    id: number;
    talentTree: TalentTree;
    talentTreeId: number;
    talent: Talent;
    talentId: number;
    posX: number;
    posY: number;
    order: number;
}
