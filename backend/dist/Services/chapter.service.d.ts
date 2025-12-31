import { Repository } from 'typeorm';
import { Chapter } from '../Entities/chapter.entity';
import { Campaign } from '../Entities/campaign.entity';
import { Resource } from '../Entities/resource.entity';
export declare class ChapterService {
    private chapterRepository;
    private campaignRepository;
    private resourceRepository;
    constructor(chapterRepository: Repository<Chapter>, campaignRepository: Repository<Campaign>, resourceRepository: Repository<Resource>);
    findAll(): Promise<Chapter[]>;
    private findDuplicateByName;
    private assertUniqueName;
    private static readonly CREDITS_NAME;
    private normalizeName;
    private isCreditsName;
    private ensureCreditsChapterForCampaign;
    findAllByCampaign(campaignId: number): Promise<Chapter[]>;
    findOne(id: number): Promise<Chapter | null>;
    create(data: Partial<Chapter>): Promise<Chapter>;
    update(id: number, data: Partial<Chapter>): Promise<Chapter | null>;
    remove(id: number): Promise<void>;
    getResources(chapterId: number): Promise<Resource[]>;
    setResourceIds(chapterId: number, resourceIds: number[]): Promise<Chapter>;
}
