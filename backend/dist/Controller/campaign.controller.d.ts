import { CampaignService } from '../Services/campaign.service';
import { Campaign } from '../Entities/campaign.entity';
export declare class CampaignController {
    private readonly campaignService;
    constructor(campaignService: CampaignService);
    findAllBySaga(sagaId: string): Promise<Campaign[]>;
    findOne(id: string): Promise<Campaign | null>;
    create(data: any, files: {
        image?: Express.Multer.File[];
        file?: Express.Multer.File[];
    }): Promise<Campaign>;
    update(id: string, data: any, files: {
        image?: Express.Multer.File[];
        file?: Express.Multer.File[];
    }): Promise<Campaign | null>;
    remove(id: string): Promise<void>;
}
