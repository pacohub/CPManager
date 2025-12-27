import { ObjectiveItem } from '../interfaces/objective';

const API_URL = 'http://localhost:4000/objectives';

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

export async function getObjectives(filters?: { eventId?: number; mechanicId?: number; chapterId?: number }): Promise<ObjectiveItem[]> {
	const params = new URLSearchParams();
	if (filters?.eventId !== undefined) params.set('eventId', String(filters.eventId));
	if (filters?.mechanicId !== undefined) params.set('mechanicId', String(filters.mechanicId));
	if (filters?.chapterId !== undefined) params.set('chapterId', String(filters.chapterId));
	const url = params.toString() ? `${API_URL}?${params}` : API_URL;
	const res = await fetch(url);
	return ensureOk<ObjectiveItem[]>(res);
}

export async function getObjective(id: number): Promise<ObjectiveItem> {
	const res = await fetch(`${API_URL}/${id}`);
	return ensureOk<ObjectiveItem>(res);
}

export async function createObjective(data: {
	name: string;
	description?: string;
	detailedDescription?: string;
	difficulty: string;
	initialValue: number;
	difficultyIncrement: number;
	eventId: number;
	mechanicId: number;
	position?: number;
}): Promise<ObjectiveItem> {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<ObjectiveItem>(res);
}

export async function updateObjective(
	id: number,
	data: Partial<{
		name: string;
		description: string;
		detailedDescription: string;
		difficulty: string;
		initialValue: number;
		difficultyIncrement: number;
		eventId: number;
		mechanicId: number;
		position: number;
	}>,
): Promise<ObjectiveItem> {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<ObjectiveItem>(res);
}

export async function deleteObjective(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}
