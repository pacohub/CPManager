import { Repository } from 'typeorm';
import { Chapter } from '../Entities/chapter.entity';
export declare class ChapterService {
    private chapterRepository;
    constructor(chapterRepository: Repository<Chapter>);
    findAllByCampaign(campaignId: number): Promise<Chapter[]>;
    findOne(id: number): Promise<Chapter | null>;
    create(data: Partial<Chapter>): Promise<Chapter>;
    update(id: number, data: Partial<Chapter>): Promise<Chapter | null>;
    remove(id: number): Promise<void>;
}
