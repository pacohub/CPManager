import { ClassItem } from '../interfaces/class';

const API_URL = 'http://localhost:4000/classes';

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

export async function getClasses(): Promise<ClassItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<ClassItem[]>(res);
}

export async function getClass(id: number): Promise<ClassItem> {
	const res = await fetch(`${API_URL}/${id}`);
	return ensureOk<ClassItem>(res);
}

export async function createClass(data: { name: string; icon?: string; description?: string; level?: number }): Promise<ClassItem> {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<ClassItem>(res);
}

export async function updateClass(
	id: number,
	data: Partial<{ name: string; icon: string; description: string; level: number; animationIds: number[] }>,
): Promise<ClassItem> {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<ClassItem>(res);
}

export async function uploadClassIcon(file: File): Promise<string> {
	const formData = new FormData();
	formData.append('iconImage', file);
	const res = await fetch(`${API_URL}/upload-icon`, {
		method: 'POST',
		body: formData,
	});
	if (res.status === 404) {
		throw new Error('El backend no tiene el endpoint /classes/upload-icon. Reinicia el backend (o recompila y vuelve a arrancarlo) para cargar los cambios.');
	}
	const payload = await ensureOk<{ icon: string }>(res);
	return (payload?.icon || '').trim();
}

export async function deleteClass(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}
