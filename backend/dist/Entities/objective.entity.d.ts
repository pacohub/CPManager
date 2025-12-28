import { Event, EventDifficulty } from './event.entity';
import { Mechanic } from './mechanic.entity';
export declare class Objective {
    id: number;
    position: number;
    name: string;
    description: string;
    detailedDescription: string;
    difficulty: EventDifficulty;
    initialValue: number;
    difficultyIncrement: number;
    event: Event;
    mechanic: Mechanic;
}
