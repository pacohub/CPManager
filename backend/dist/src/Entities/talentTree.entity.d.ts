import { TalentTreeTalent } from './talentTreeTalent.entity';
import { TalentTreeLink } from './talentTreeLink.entity';
export declare class TalentTree {
    id: number;
    name: string;
    file: string;
    entries: TalentTreeTalent[];
    links: TalentTreeLink[];
}
