import { Repository } from 'typeorm';
import { Campaign } from '../Entities/campaign.entity';
export declare class CampaignService {
    private campaignRepository;
    constructor(campaignRepository: Repository<Campaign>);
    findAllBySaga(sagaId: number): Promise<Campaign[]>;
    findOne(id: number): Promise<Campaign | null>;
    create(data: Partial<Campaign>): Promise<Campaign>;
    update(id: number, data: Partial<Campaign>): Promise<Campaign | null>;
    remove(id: number): Promise<void>;
}
