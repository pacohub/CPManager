import { Mechanic } from '../Entities/mechanic.entity';
import { MechanicService } from '../Services/mechanic.service';
export declare class MechanicController {
    private readonly mechanicService;
    constructor(mechanicService: MechanicService);
    findAll(): Promise<Mechanic[]>;
    findOne(id: string): Promise<Mechanic | null>;
    create(data: any): Promise<Mechanic>;
    update(id: string, data: any): Promise<Mechanic | null>;
    remove(id: string): Promise<void>;
}
