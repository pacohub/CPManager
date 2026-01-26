import { DefenseType } from '../Entities/defenseType.entity';
import { DefenseTypeService } from '../Services/defenseType.service';
export declare class DefenseTypeController {
    private readonly defenseTypeService;
    constructor(defenseTypeService: DefenseTypeService);
    findAll(): Promise<DefenseType[]>;
    findOne(id: string): Promise<DefenseType | null>;
    create(data: any): Promise<DefenseType>;
    uploadIcon(file?: Express.Multer.File): Promise<{
        icon: string;
    }>;
    update(id: string, data: any): Promise<DefenseType | null>;
    remove(id: string): Promise<void>;
}
