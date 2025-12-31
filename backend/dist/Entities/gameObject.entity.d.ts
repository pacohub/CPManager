import { Campaign } from './campaign.entity';
export declare class GameObject {
    id: number;
    name: string;
    icon: string;
    description: string;
    fileLink: string;
    campaigns: Campaign[];
}
