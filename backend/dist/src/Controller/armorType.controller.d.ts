import { ArmorType } from '../Entities/armorType.entity';
import { ArmorTypeService } from '../Services/armorType.service';
export declare class ArmorTypeController {
    private readonly armorTypeService;
    constructor(armorTypeService: ArmorTypeService);
    findAll(): Promise<ArmorType[]>;
    resetToDefaults(): Promise<ArmorType[]>;
    findOne(id: string): Promise<ArmorType | null>;
    create(data: any): Promise<ArmorType>;
    update(id: string, data: any): Promise<ArmorType | null>;
    remove(id: string): Promise<void>;
}
