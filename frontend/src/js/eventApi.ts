import { EventItem } from '../interfaces/event';

const API_URL = 'http://localhost:4000/events';

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

export async function getEvents(filters?: { chapterId?: number; mapId?: number }): Promise<EventItem[]> {
	const params = new URLSearchParams();
	if (filters?.chapterId !== undefined) params.set('chapterId', String(filters.chapterId));
	if (filters?.mapId !== undefined) params.set('mapId', String(filters.mapId));
	const url = params.toString() ? `${API_URL}?${params}` : API_URL;
	const res = await fetch(url);
	return ensureOk<EventItem[]>(res);
}

export async function getEventCountsByChapter(
	campaignId: number,
): Promise<Record<number, { count: number; warningCount: number; missionCount: number; cinematicCount: number }>> {
	const res = await fetch(`${API_URL}/count-by-chapter?campaignId=${encodeURIComponent(String(campaignId))}`);
	const rows = await ensureOk<Array<{ chapterId: number; count: number; warningCount: number; missionCount: number; cinematicCount: number }>>(res);
	const out: Record<number, { count: number; warningCount: number; missionCount: number; cinematicCount: number }> = {};
	for (const r of rows ?? []) {
		const chapterId = Number((r as any).chapterId);
		out[chapterId] = {
			count: Number((r as any).count) || 0,
			warningCount: Number((r as any).warningCount) || 0,
			missionCount: Number((r as any).missionCount) || 0,
			cinematicCount: Number((r as any).cinematicCount) || 0,
		};
	}
	return out;
}

export async function getEvent(id: number): Promise<EventItem> {
	const res = await fetch(`${API_URL}/${id}`);
	return ensureOk<EventItem>(res);
}

export async function createEvent(data: {
	name: string;
	description?: string;
	type: string;
	difficulty: string;
	file?: string;
	chapterId: number;
	mapId: number;
}): Promise<EventItem> {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<EventItem>(res);
}

export async function updateEvent(
	id: number,
	data: Partial<{
		position: number;
		name: string;
		description: string;
		type: string;
		difficulty: string;
		file: string;
		chapterId: number;
		mapId: number;
	}>,
): Promise<EventItem> {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<EventItem>(res);
}

export async function deleteEvent(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}

