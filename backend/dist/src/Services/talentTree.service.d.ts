import { Repository } from 'typeorm';
import { TalentTree } from '../Entities/talentTree.entity';
import { TalentTreeTalent } from '../Entities/talentTreeTalent.entity';
import { TalentTreeLink } from '../Entities/talentTreeLink.entity';
import { Talent } from '../Entities/talent.entity';
export declare class TalentTreeService {
    private treeRepository;
    private entryRepository;
    private linkRepository;
    private talentRepository;
    constructor(treeRepository: Repository<TalentTree>, entryRepository: Repository<TalentTreeTalent>, linkRepository: Repository<TalentTreeLink>, talentRepository: Repository<Talent>);
    findAll(): Promise<TalentTree[]>;
    findOne(id: number): Promise<TalentTree | null>;
    create(data: Partial<TalentTree>): Promise<TalentTree>;
    update(id: number, data: Partial<TalentTree>): Promise<TalentTree | null>;
    remove(id: number): Promise<void>;
}
