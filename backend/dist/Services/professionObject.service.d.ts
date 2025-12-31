import { Repository } from 'typeorm';
import { ProfessionObject } from '../Entities/professionObject.entity';
import { Profession } from '../Entities/profession.entity';
export type ProfessionObjectInput = {
    objectId: number;
    level?: number;
    quantity?: number;
    timeSeconds?: number;
};
export declare class ProfessionObjectService {
    private professionObjectRepository;
    private professionRepository;
    constructor(professionObjectRepository: Repository<ProfessionObject>, professionRepository: Repository<Profession>);
    findByProfession(professionId: number): Promise<ProfessionObject[]>;
    replaceForProfession(professionId: number, links: ProfessionObjectInput[]): Promise<ProfessionObject[]>;
}
