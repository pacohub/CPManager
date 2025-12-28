import { Repository } from 'typeorm';
import { ProfessionObjectResource } from '../Entities/professionObjectResource.entity';
import { Profession } from '../Entities/profession.entity';
export type ProfessionObjectResourceInput = {
    resourceId: number;
    quantity?: number;
};
export declare class ProfessionObjectResourceService {
    private professionObjectResourceRepository;
    private professionRepository;
    constructor(professionObjectResourceRepository: Repository<ProfessionObjectResource>, professionRepository: Repository<Profession>);
    findForObject(professionId: number, objectId: number): Promise<ProfessionObjectResource[]>;
    findByProfession(professionId: number): Promise<ProfessionObjectResource[]>;
    replaceForObject(professionId: number, objectId: number, links: ProfessionObjectResourceInput[]): Promise<ProfessionObjectResource[]>;
}
