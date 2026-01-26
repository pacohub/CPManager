import { Repository } from 'typeorm';
import { Animation } from '../Entities/animation.entity';
import { Class } from '../Entities/class.entity';
import { TalentTree } from '../Entities/talentTree.entity';
export declare class ClassService {
    private classRepository;
    private animationRepository;
    private talentTreeRepository;
    constructor(classRepository: Repository<Class>, animationRepository: Repository<Animation>, talentTreeRepository: Repository<TalentTree>);
    private coerceIdArray;
    private normalizeText;
    private normalizeLevel;
    findAll(): Promise<Class[]>;
    findOne(id: number): Promise<Class | null>;
    create(data: any): Promise<Class>;
    update(id: number, data: any): Promise<Class | null>;
    remove(id: number): Promise<void>;
}
