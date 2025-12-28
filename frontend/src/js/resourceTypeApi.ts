import { ResourceTypeItem } from '../interfaces/resourceType';

const API_URL = 'http://localhost:4000/resource-types';

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

export async function getResourceTypes(): Promise<ResourceTypeItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<ResourceTypeItem[]>(res);
}

export async function getResourceType(id: number): Promise<ResourceTypeItem> {
	const res = await fetch(`${API_URL}/${id}`);
	return ensureOk<ResourceTypeItem>(res);
}

export async function createResourceType(data: { name: string }): Promise<ResourceTypeItem> {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<ResourceTypeItem>(res);
}

export async function updateResourceType(id: number, data: { name: string }): Promise<ResourceTypeItem> {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<ResourceTypeItem>(res);
}

export async function deleteResourceType(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}
