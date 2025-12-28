import { ProfessionObjectLink } from '../interfaces/professionObject';

const API_URL = 'http://localhost:4000/profession-objects';

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

export async function getProfessionObjects(professionId: number): Promise<ProfessionObjectLink[]> {
	const res = await fetch(`${API_URL}/${professionId}`);
	return ensureOk<ProfessionObjectLink[]>(res);
}

export async function replaceProfessionObjects(
	professionId: number,
	links: Array<Pick<ProfessionObjectLink, 'objectId' | 'level' | 'quantity' | 'timeSeconds'>>,
): Promise<ProfessionObjectLink[]> {
	const res = await fetch(`${API_URL}/${professionId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ links }),
	});
	return ensureOk<ProfessionObjectLink[]>(res);
}
