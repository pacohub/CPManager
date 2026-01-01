import { Repository } from 'typeorm';
import { Animation } from '../Entities/animation.entity';
import { Character } from '../Entities/character.entity';
import { Class } from '../Entities/class.entity';
import { Race } from '../Entities/race.entity';
export declare class CharacterService {
    private characterRepository;
    private classRepository;
    private raceRepository;
    private animationRepository;
    constructor(characterRepository: Repository<Character>, classRepository: Repository<Class>, raceRepository: Repository<Race>, animationRepository: Repository<Animation>);
    private coerceIdArray;
    private baseQuery;
    findAll(): Promise<Character[]>;
    findOne(id: number): Promise<Character | null>;
    create(data: any): Promise<Character>;
    update(id: number, data: any): Promise<Character | null>;
    remove(id: number): Promise<void>;
    getChildren(parentId: number): Promise<Character[]>;
    createChild(parentId: number, data: any): Promise<Character>;
    updateChild(parentId: number, childId: number, data: any): Promise<Character | null>;
    removeChild(parentId: number, childId: number): Promise<void>;
}
