import { Repository } from 'typeorm';
import { ChapterFaction } from '../Entities/chapterFaction.entity';
import { Chapter } from '../Entities/chapter.entity';
export type ChapterFactionInput = {
    factionId: number;
    groupName: string;
    order?: number;
    isPlayable?: boolean;
    colorOverride?: string;
};
export declare class ChapterFactionService {
    private chapterFactionRepository;
    private chapterRepository;
    constructor(chapterFactionRepository: Repository<ChapterFaction>, chapterRepository: Repository<Chapter>);
    private normalizeNameForCompare;
    private isCreditsChapter;
    private assertNotCredits;
    findByChapter(chapterId: number): Promise<ChapterFaction[]>;
    findByCampaign(campaignId: number): Promise<ChapterFaction[]>;
    replaceForChapter(chapterId: number, links: ChapterFactionInput[]): Promise<ChapterFaction[]>;
    setColorOverride(chapterId: number, factionId: number, colorOverride: string | null): Promise<ChapterFaction | null>;
}
