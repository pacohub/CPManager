import { ArmorTypeItem } from '../interfaces/armorType';

const API_URL = 'http://localhost:4000/armor-types';

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

export async function getArmorTypes(): Promise<ArmorTypeItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<ArmorTypeItem[]>(res);
}

export async function getArmorType(id: number): Promise<ArmorTypeItem> {
	const res = await fetch(`${API_URL}/${id}`);
	return ensureOk<ArmorTypeItem>(res);
}

export async function createArmorType(data: { name: string; soundIds?: number[] }): Promise<ArmorTypeItem> {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name: data.name, soundIds: data.soundIds ?? [] }),
	});
	return ensureOk<ArmorTypeItem>(res);
}

export async function updateArmorType(id: number, data: { name?: string; soundIds?: number[] }): Promise<ArmorTypeItem> {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<ArmorTypeItem>(res);
}

export async function deleteArmorType(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}
