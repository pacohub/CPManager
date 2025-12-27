import { ProfessionItem } from '../interfaces/profession';

const API_URL = 'http://localhost:4000/professions';

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

export async function getProfessions(): Promise<ProfessionItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<ProfessionItem[]>(res);
}

export async function getProfession(id: number): Promise<ProfessionItem> {
	const res = await fetch(`${API_URL}/${id}`);
	return ensureOk<ProfessionItem>(res);
}

export async function createProfession(data: { name: string; description?: string; link?: string }): Promise<ProfessionItem> {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<ProfessionItem>(res);
}

export async function updateProfession(
	id: number,
	data: Partial<{ name: string; description: string; link: string }>,
): Promise<ProfessionItem> {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<ProfessionItem>(res);
}

export async function deleteProfession(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}
