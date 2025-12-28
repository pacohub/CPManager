import { ComponentItem } from '../interfaces/component';

const API_URL = 'http://localhost:4000/components';

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

export async function getComponents(): Promise<ComponentItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<ComponentItem[]>(res);
}

export async function createComponent(data: FormData): Promise<ComponentItem> {
	const res = await fetch(API_URL, {
		method: 'POST',
		body: data,
	});
	return ensureOk<ComponentItem>(res);
}

export async function updateComponent(
	id: number,
	data: FormData,
): Promise<ComponentItem> {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		body: data,
	});
	return ensureOk<ComponentItem>(res);
}

export async function deleteComponent(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}
