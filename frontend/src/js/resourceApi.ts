import { ResourceItem } from '../interfaces/resource';

const API_URL = 'http://localhost:4000/resources';

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

export async function getResources(): Promise<ResourceItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<ResourceItem[]>(res);
}

export async function getResource(id: number): Promise<ResourceItem> {
	const res = await fetch(`${API_URL}/${id}`);
	return ensureOk<ResourceItem>(res);
}

export async function createResource(data: FormData): Promise<ResourceItem> {
	const res = await fetch(API_URL, { method: 'POST', body: data });
	return ensureOk<ResourceItem>(res);
}

export async function updateResource(id: number, data: FormData): Promise<ResourceItem> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', body: data });
	return ensureOk<ResourceItem>(res);
}

export async function deleteResource(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}
