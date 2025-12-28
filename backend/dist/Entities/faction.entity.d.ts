import { Profession } from './profession.entity';
export declare class Faction {
    id: number;
    name: string;
    description: string;
    crestImage: string;
    iconImage: string;
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    file: string;
    professions: Profession[];
}
