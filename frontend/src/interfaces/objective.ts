import { EventDifficulty, EventItem } from './event';
import { MechanicItem } from './mechanic';

export interface ObjectiveItem {
	id: number;
	position?: number;
	name: string;
	description?: string;
	detailedDescription?: string;
	difficulty: EventDifficulty;
	initialValue: number;
	difficultyIncrement: number;

	event?: EventItem;
	mechanic?: MechanicItem;

	eventId?: number;
	mechanicId?: number;
}
