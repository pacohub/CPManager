import { Class } from '../Entities/class.entity';
import { ClassService } from '../Services/class.service';
export declare class ClassController {
    private readonly classService;
    constructor(classService: ClassService);
    findAll(): Promise<Class[]>;
    findOne(id: string): Promise<Class | null>;
    create(data: any): Promise<Class>;
    uploadIcon(file?: Express.Multer.File): Promise<{
        icon: string;
    }>;
    update(id: string, data: any): Promise<Class | null>;
    remove(id: string): Promise<void>;
}
