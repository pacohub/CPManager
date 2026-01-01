import { Animation } from './animation.entity';
import { Class } from './class.entity';
import { Race } from './race.entity';
export declare class Character {
    id: number;
    name: string;
    icon: string | null;
    image: string | null;
    model: string | null;
    parent: Character | null;
    parentId: number | null;
    class: Class;
    classId: number;
    race?: Race | null;
    raceId: number | null;
    children: Character[];
    animations: Animation[];
}
