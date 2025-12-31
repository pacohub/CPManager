import { Resource } from './resource.entity';
export declare enum ChapterSpecialType {
    CREDITS = "CREDITS"
}
export declare class Chapter {
    id: number;
    campaignId: number;
    name: string;
    order: number;
    description: string;
    image: string;
    file: string;
    specialType: ChapterSpecialType | null;
    resources: Resource[];
}
