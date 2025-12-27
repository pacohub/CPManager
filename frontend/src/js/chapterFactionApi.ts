import { ChapterFactionLink, ChapterFactionsByChapterId } from '../interfaces/chapterFaction';

const API_URL = 'http://localhost:4000/chapter-factions';

async function readJsonSafely(res: Response): Promise<any> {
	const text = await res.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

async function ensureOk<T>(res: Response): Promise<T> {
	const payload = await readJsonSafely(res);
	if (!res.ok) {
		const details = typeof payload === 'string' ? payload : JSON.stringify(payload);
		throw new Error(`HTTP ${res.status} ${res.statusText} - ${details}`);
	}
	return payload as T;
}

export async function getChapterFactionsByCampaign(campaignId: number): Promise<ChapterFactionsByChapterId> {
	const res = await fetch(`${API_URL}/by-campaign?campaignId=${campaignId}`);
	return ensureOk<ChapterFactionsByChapterId>(res);
}

export async function getChapterFactions(chapterId: number): Promise<ChapterFactionLink[]> {
	const res = await fetch(`${API_URL}/${chapterId}`);
	return ensureOk<ChapterFactionLink[]>(res);
}

export async function replaceChapterFactions(chapterId: number, links: Array<Partial<ChapterFactionLink>>): Promise<ChapterFactionLink[]> {
	const res = await fetch(`${API_URL}/${chapterId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ links }),
	});
	return ensureOk<ChapterFactionLink[]>(res);
}

export async function setChapterFactionColorOverride(
	chapterId: number,
	factionId: number,
	colorOverride: string | null,
): Promise<ChapterFactionLink | null> {
	const res = await fetch(`${API_URL}/${chapterId}/${factionId}/color`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ colorOverride }),
	});
	return ensureOk<ChapterFactionLink | null>(res);
}
