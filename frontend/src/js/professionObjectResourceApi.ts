import { ProfessionObjectResourceLink } from '../interfaces/professionObjectResource';

const API_URL = 'http://localhost:4000/profession-object-resources';

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

export async function getProfessionObjectResources(
	professionId: number,
	objectId: number,
): Promise<ProfessionObjectResourceLink[]> {
	const res = await fetch(`${API_URL}/${professionId}/${objectId}`);
	return ensureOk<ProfessionObjectResourceLink[]>(res);
}

export async function getProfessionObjectResourcesByProfession(
	professionId: number,
): Promise<Record<number, ProfessionObjectResourceLink[]>> {
	const res = await fetch(`${API_URL}/by-profession?professionId=${professionId}`);
	return ensureOk<Record<number, ProfessionObjectResourceLink[]>>(res);
}

export async function replaceProfessionObjectResources(
	professionId: number,
	objectId: number,
	links: Array<Pick<ProfessionObjectResourceLink, 'resourceId' | 'quantity'>>,
): Promise<ProfessionObjectResourceLink[]> {
	const res = await fetch(`${API_URL}/${professionId}/${objectId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ links }),
	});
	return ensureOk<ProfessionObjectResourceLink[]>(res);
}
