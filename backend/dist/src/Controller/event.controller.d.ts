import { Event } from '../Entities/event.entity';
import { EventService } from '../Services/event.service';
export declare class EventController {
    private readonly eventService;
    constructor(eventService: EventService);
    countByChapter(campaignId?: string): Promise<Array<{
        chapterId: number;
        count: number;
        warningCount: number;
        missionCount: number;
        cinematicCount: number;
    }>>;
    findAll(chapterId?: string, mapId?: string): Promise<Event[]>;
    findOne(id: string): Promise<Event | null>;
    create(data: any): Promise<Event>;
    update(id: string, data: any): Promise<Event>;
    remove(id: string): Promise<void>;
}
