import { FactionItem } from '../interfaces/faction';
import { ProfessionItem } from '../interfaces/profession';
import { ClassItem } from '../interfaces/class';

const API_URL = 'http://localhost:4000/factions';

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

export async function getFactions(): Promise<FactionItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<FactionItem[]>(res);
}

export async function getFaction(id: number): Promise<FactionItem> {
	const res = await fetch(`${API_URL}/${id}`);
	return ensureOk<FactionItem>(res);
}

export async function createFaction(data: FormData): Promise<FactionItem> {
	const res = await fetch(API_URL, { method: 'POST', body: data });
	return ensureOk<FactionItem>(res);
}

export async function updateFaction(id: number, data: FormData): Promise<FactionItem> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', body: data });
	return ensureOk<FactionItem>(res);
}

export async function deleteFaction(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}

export async function getFactionProfessions(factionId: number): Promise<ProfessionItem[]> {
	const res = await fetch(`${API_URL}/${factionId}/professions`);
	return ensureOk<ProfessionItem[]>(res);
}

export async function setFactionProfessions(factionId: number, professionIds: number[]): Promise<FactionItem> {
	const res = await fetch(`${API_URL}/${factionId}/professions`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ professionIds }),
	});
	return ensureOk<FactionItem>(res);
}

export async function getFactionClasses(factionId: number): Promise<ClassItem[]> {
	const res = await fetch(`${API_URL}/${factionId}/classes`);
	return ensureOk<ClassItem[]>(res);
}

export async function setFactionClasses(factionId: number, classIds: number[]): Promise<FactionItem> {
	const res = await fetch(`${API_URL}/${factionId}/classes`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ classIds }),
	});
	return ensureOk<FactionItem>(res);
}
