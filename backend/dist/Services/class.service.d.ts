import { Repository } from 'typeorm';
import { Class } from '../Entities/class.entity';
export declare class ClassService {
    private classRepository;
    constructor(classRepository: Repository<Class>);
    private normalizeText;
    private normalizeLevel;
    findAll(): Promise<Class[]>;
    findOne(id: number): Promise<Class | null>;
    create(data: any): Promise<Class>;
    update(id: number, data: any): Promise<Class | null>;
    remove(id: number): Promise<void>;
}
