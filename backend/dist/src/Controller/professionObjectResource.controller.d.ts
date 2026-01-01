import { ProfessionObjectResource } from '../Entities/professionObjectResource.entity';
import { ProfessionObjectResourceService } from '../Services/professionObjectResource.service';
export declare class ProfessionObjectResourceController {
    private readonly professionObjectResourceService;
    constructor(professionObjectResourceService: ProfessionObjectResourceService);
    byProfession(professionId: string): Promise<Record<number, ProfessionObjectResource[]>>;
    getForObject(professionId: string, objectId: string): Promise<ProfessionObjectResource[]>;
    replaceForObject(professionId: string, objectId: string, body: any): Promise<ProfessionObjectResource[]>;
}
