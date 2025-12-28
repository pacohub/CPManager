import { SoundItem } from '../interfaces/sound';

const API_URL = 'http://localhost:4000/sounds';

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

export async function getSounds(): Promise<SoundItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<SoundItem[]>(res);
}

export async function createSound(data: FormData): Promise<SoundItem> {
	const res = await fetch(API_URL, { method: 'POST', body: data });
	return ensureOk<SoundItem>(res);
}

export async function updateSound(id: number, data: FormData): Promise<SoundItem> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', body: data });
	return ensureOk<SoundItem>(res);
}

export async function deleteSound(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}
