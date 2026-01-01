import { Profession } from '../Entities/profession.entity';
import { ProfessionService } from '../Services/profession.service';
export declare class ProfessionController {
    private readonly professionService;
    constructor(professionService: ProfessionService);
    findAll(): Promise<Profession[]>;
    findOne(id: string): Promise<Profession | null>;
    create(data: any): Promise<Profession>;
    update(id: string, data: any): Promise<Profession | null>;
    remove(id: string): Promise<void>;
}
