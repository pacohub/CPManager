import { Chapter } from './chapter.entity';
import { Map } from './map.entity';
export declare enum EventType {
    EVENT = "EVENT",
    MISSION = "MISSION",
    SECONDARY_MISSION = "SECONDARY_MISSION",
    DAILY_MISSION = "DAILY_MISSION",
    WEEKLY_MISSION = "WEEKLY_MISSION",
    CINEMATIC = "CINEMATIC",
    MOBA = "MOBA"
}
export declare enum EventDifficulty {
    EASY = "EASY",
    NORMAL = "NORMAL",
    HARD = "HARD"
}
export type MobaTeam = {
    name: string;
    factionIds: number[];
};
export type MobaConfig = {
    teams: MobaTeam[];
};
export type DialogueLine = {
    speaker?: string;
    text: string;
};
export type DialogueConfig = {
    lines: DialogueLine[];
};
export declare class Event {
    id: number;
    position: number;
    name: string;
    description: string;
    type: EventType;
    difficulty: EventDifficulty;
    file: string;
    moba: MobaConfig | null;
    dialogue: DialogueConfig | null;
    chapter: Chapter;
    map: Map;
}
