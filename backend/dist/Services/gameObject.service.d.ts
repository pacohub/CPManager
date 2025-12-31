import { Repository } from 'typeorm';
import { Campaign } from '../Entities/campaign.entity';
import { GameObject } from '../Entities/gameObject.entity';
export declare class GameObjectService {
    private gameObjectRepository;
    private campaignRepository;
    constructor(gameObjectRepository: Repository<GameObject>, campaignRepository: Repository<Campaign>);
    private normalizeText;
    findAll(): Promise<GameObject[]>;
    findOne(id: number): Promise<GameObject | null>;
    create(data: any): Promise<GameObject>;
    update(id: number, data: any): Promise<GameObject | null>;
    remove(id: number): Promise<void>;
    getCampaigns(objectId: number): Promise<Campaign[]>;
    setCampaignIds(objectId: number, campaignIds: number[]): Promise<GameObject>;
}
