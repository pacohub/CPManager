export interface ChapterFactionLink {
	id?: number;
	chapterId: number;
	factionId: number;
	groupName: string;
	order?: number;
	isPlayable?: boolean;
	colorOverride?: string | null;
}

export type ChapterFactionsByChapterId = Record<number, ChapterFactionLink[]>;
