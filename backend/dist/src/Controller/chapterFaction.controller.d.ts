import { ChapterFactionService } from '../Services/chapterFaction.service';
import { ChapterFaction } from '../Entities/chapterFaction.entity';
export declare class ChapterFactionController {
    private readonly chapterFactionService;
    constructor(chapterFactionService: ChapterFactionService);
    byCampaign(campaignId: string): Promise<Record<number, ChapterFaction[]>>;
    getForChapter(chapterId: string): Promise<ChapterFaction[]>;
    replaceForChapter(chapterId: string, body: any): Promise<ChapterFaction[]>;
    setColorOverride(chapterId: string, factionId: string, body: any): Promise<ChapterFaction | null>;
}
