import { ResourceItem } from '../interfaces/resource';

const API_URL = 'http://localhost:4000/chapters';

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

export async function getChapterResources(chapterId: number): Promise<ResourceItem[]> {
	const res = await fetch(`${API_URL}/${chapterId}/resources`);
	return ensureOk<ResourceItem[]>(res);
}

export async function setChapterResources(chapterId: number, resourceIds: number[]): Promise<void> {
	const res = await fetch(`${API_URL}/${chapterId}/resources`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ resourceIds }),
	});
	await ensureOk<void>(res);
}
