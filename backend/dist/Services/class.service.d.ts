import { Repository } from 'typeorm';
import { Animation } from '../Entities/animation.entity';
import { Class } from '../Entities/class.entity';
export declare class ClassService {
    private classRepository;
    private animationRepository;
    constructor(classRepository: Repository<Class>, animationRepository: Repository<Animation>);
    private coerceIdArray;
    private normalizeText;
    private normalizeLevel;
    findAll(): Promise<Class[]>;
    findOne(id: number): Promise<Class | null>;
    create(data: any): Promise<Class>;
    update(id: number, data: any): Promise<Class | null>;
    remove(id: number): Promise<void>;
}
