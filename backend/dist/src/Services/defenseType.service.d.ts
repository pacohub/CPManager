import { Repository } from 'typeorm';
import { DefenseType } from '../Entities/defenseType.entity';
export declare class DefenseTypeService {
    private defenseTypeRepository;
    constructor(defenseTypeRepository: Repository<DefenseType>);
    private normalize;
    findAll(): Promise<DefenseType[]>;
    findOne(id: number): Promise<DefenseType | null>;
    create(data: Partial<DefenseType>): Promise<DefenseType>;
    update(id: number, data: Partial<DefenseType>): Promise<DefenseType | null>;
    remove(id: number): Promise<void>;
}
