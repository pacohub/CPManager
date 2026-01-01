import { Chapter } from '../Entities/chapter.entity';
import { Resource } from '../Entities/resource.entity';
import { ChapterService } from '../Services/chapter.service';
export declare class ChapterController {
    private readonly chapterService;
    constructor(chapterService: ChapterService);
    findAllByCampaign(campaignId?: string): Promise<Chapter[]>;
    findOne(id: string): Promise<Chapter | null>;
    create(data: any, files: {
        image?: Express.Multer.File[];
    }): Promise<Chapter>;
    update(id: string, data: any, files: {
        image?: Express.Multer.File[];
    }): Promise<Chapter | null>;
    remove(id: string): Promise<void>;
    getResources(id: string): Promise<Resource[]>;
    setResources(id: string, body: any): Promise<Chapter>;
}
