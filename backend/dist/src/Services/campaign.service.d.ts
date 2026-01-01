import { Repository } from 'typeorm';
import { Campaign } from '../Entities/campaign.entity';
import { Chapter } from '../Entities/chapter.entity';
export declare class CampaignService {
    private campaignRepository;
    private chapterRepository;
    constructor(campaignRepository: Repository<Campaign>, chapterRepository: Repository<Chapter>);
    findAllBySaga(sagaId?: number): Promise<Campaign[]>;
    findOne(id: number): Promise<Campaign | null>;
    create(data: Partial<Campaign>): Promise<Campaign>;
    update(id: number, data: Partial<Campaign>): Promise<Campaign | null>;
    remove(id: number): Promise<void>;
}
