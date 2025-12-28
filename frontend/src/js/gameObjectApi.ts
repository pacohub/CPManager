import { GameObjectItem } from '../interfaces/gameObject';
import { Campaign } from '../interfaces/campaign';

const API_URL = 'http://localhost:4000/objects';

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

export async function getObjects(): Promise<GameObjectItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<GameObjectItem[]>(res);
}

export async function getObject(id: number): Promise<GameObjectItem> {
	const res = await fetch(`${API_URL}/${id}`);
	return ensureOk<GameObjectItem>(res);
}

export async function createObject(data: { name: string; icon?: string; description?: string; fileLink?: string }): Promise<GameObjectItem> {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<GameObjectItem>(res);
}

export async function updateObject(
	id: number,
	data: Partial<{ name: string; icon: string; description: string; fileLink: string }>,
): Promise<GameObjectItem> {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<GameObjectItem>(res);
}

export async function uploadObjectIcon(file: File): Promise<string> {
	const formData = new FormData();
	formData.append('iconImage', file);
	const res = await fetch(`${API_URL}/upload-icon`, {
		method: 'POST',
		body: formData,
	});
	if (res.status === 404) {
		throw new Error('El backend no tiene el endpoint /objects/upload-icon. Reinicia el backend (o recompila y vuelve a arrancarlo) para cargar los cambios.');
	}
	const payload = await ensureOk<{ icon: string }>(res);
	return (payload?.icon || '').trim();
}

export async function deleteObject(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}

export async function getObjectCampaigns(objectId: number): Promise<Campaign[]> {
	const res = await fetch(`${API_URL}/${objectId}/campaigns`);
	return ensureOk<Campaign[]>(res);
}

export async function setObjectCampaigns(objectId: number, campaignIds: number[]): Promise<GameObjectItem> {
	const res = await fetch(`${API_URL}/${objectId}/campaigns`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ campaignIds }),
	});
	return ensureOk<GameObjectItem>(res);
}
