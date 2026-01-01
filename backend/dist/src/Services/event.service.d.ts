import { Repository } from 'typeorm';
import { Chapter } from '../Entities/chapter.entity';
import { Event } from '../Entities/event.entity';
import { Map } from '../Entities/map.entity';
type EventFilters = {
    chapterId?: number;
    mapId?: number;
};
export declare class EventService {
    private eventRepository;
    private chapterRepository;
    private mapRepository;
    constructor(eventRepository: Repository<Event>, chapterRepository: Repository<Chapter>, mapRepository: Repository<Map>);
    private normalizeText;
    private assertEnumValue;
    private normalizeNameForCompare;
    private coerceIdArray;
    private normalizeMoba;
    private normalizeDialogue;
    private isCreditsChapter;
    private assertCreditsAllowsType;
    findAll(filters?: EventFilters): Promise<Event[]>;
    private getNextPositionForChapter;
    findOne(id: number): Promise<Event | null>;
    create(data: any): Promise<Event>;
    update(id: number, data: any): Promise<Event>;
    remove(id: number): Promise<void>;
    countByChapterForCampaign(campaignId: number): Promise<Array<{
        chapterId: number;
        count: number;
        warningCount: number;
        missionCount: number;
        cinematicCount: number;
    }>>;
}
export {};
