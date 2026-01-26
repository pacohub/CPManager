import { Repository } from 'typeorm';
import { Talent } from '../Entities/talent.entity';
export declare class TalentService {
    private talentRepository;
    constructor(talentRepository: Repository<Talent>);
    findAll(): Promise<Talent[]>;
    findOne(id: number): Promise<Talent | null>;
    create(data: Partial<Talent>): Promise<Talent>;
    update(id: number, data: Partial<Talent>): Promise<Talent | null>;
    remove(id: number): Promise<void>;
}
