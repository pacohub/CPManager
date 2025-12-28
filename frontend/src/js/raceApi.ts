import { RaceItem } from '../interfaces/race';

const API_URL = 'http://localhost:4000/races';

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

export async function getRaces(): Promise<RaceItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<RaceItem[]>(res);
}

export async function createRace(data: any): Promise<RaceItem> {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<RaceItem>(res);
}

export async function updateRace(id: number, data: any): Promise<RaceItem> {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<RaceItem>(res);
}

export async function deleteRace(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}

export async function uploadRaceIcon(file: File): Promise<string> {
	const formData = new FormData();
	formData.append('iconFile', file);
	const res = await fetch(`${API_URL}/upload-icon`, { method: 'POST', body: formData });
	const json = await ensureOk<{ icon: string }>(res);
	return json.icon;
}
