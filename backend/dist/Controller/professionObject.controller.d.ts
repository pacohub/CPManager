import { ProfessionObject } from '../Entities/professionObject.entity';
import { ProfessionObjectService } from '../Services/professionObject.service';
export declare class ProfessionObjectController {
    private readonly professionObjectService;
    constructor(professionObjectService: ProfessionObjectService);
    getForProfession(professionId: string): Promise<ProfessionObject[]>;
    replaceForProfession(professionId: string, body: any): Promise<ProfessionObject[]>;
}
