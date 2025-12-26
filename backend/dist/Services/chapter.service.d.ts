import { Repository } from 'typeorm';
import { Chapter } from '../Entities/chapter.entity';
import { Campaign } from '../Entities/campaign.entity';
export declare class ChapterService {
    private chapterRepository;
    private campaignRepository;
    constructor(chapterRepository: Repository<Chapter>, campaignRepository: Repository<Campaign>);
    findAll(): Promise<Chapter[]>;
    private findDuplicateByName;
    private assertUniqueName;
    findAllByCampaign(campaignId: number): Promise<Chapter[]>;
    findOne(id: number): Promise<Chapter | null>;
    create(data: Partial<Chapter>): Promise<Chapter>;
    update(id: number, data: Partial<Chapter>): Promise<Chapter | null>;
    remove(id: number): Promise<void>;
}
