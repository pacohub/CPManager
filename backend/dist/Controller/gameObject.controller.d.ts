import { Campaign } from '../Entities/campaign.entity';
import { GameObject } from '../Entities/gameObject.entity';
import { GameObjectService } from '../Services/gameObject.service';
export declare class GameObjectController {
    private readonly gameObjectService;
    constructor(gameObjectService: GameObjectService);
    findAll(): Promise<GameObject[]>;
    findOne(id: string): Promise<GameObject | null>;
    create(data: any): Promise<GameObject>;
    uploadIcon(file?: Express.Multer.File): Promise<{
        icon: string;
    }>;
    update(id: string, data: any): Promise<GameObject | null>;
    remove(id: string): Promise<void>;
    getCampaigns(id: string): Promise<Campaign[]>;
    setCampaigns(id: string, body: any): Promise<GameObject>;
}
