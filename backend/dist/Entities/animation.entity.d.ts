import { Character } from './character.entity';
import { Class } from './class.entity';
import { Race } from './race.entity';
export declare class Animation {
    id: number;
    name: string;
    races: Race[];
    classes: Class[];
    characters: Character[];
}
