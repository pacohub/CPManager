import { Chapter } from './chapter.entity';
import { Map } from './map.entity';
export declare enum EventType {
    MISSION = "MISSION",
    CINEMATIC = "CINEMATIC"
}
export declare enum EventDifficulty {
    EASY = "EASY",
    NORMAL = "NORMAL",
    HARD = "HARD"
}
export declare class Event {
    id: number;
    position: number;
    name: string;
    description: string;
    type: EventType;
    difficulty: EventDifficulty;
    file: string;
    chapter: Chapter;
    map: Map;
}
