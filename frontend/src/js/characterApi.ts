import { CharacterItem } from '../interfaces/character';

const API_URL = 'http://localhost:4000/characters';

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

export async function getCharacters(): Promise<CharacterItem[]> {
	const res = await fetch(API_URL);
	return ensureOk<CharacterItem[]>(res);
}

export async function getCharacter(id: number): Promise<CharacterItem> {
	const res = await fetch(`${API_URL}/${id}`);
	return ensureOk<CharacterItem>(res);
}

export async function createCharacter(data: { name: string; classId: number; raceId: number; icon?: string; image?: string; model?: string }): Promise<CharacterItem> {
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<CharacterItem>(res);
}

export async function updateCharacter(
	id: number,
	data: Partial<{ name: string; classId: number; raceId: number | null; icon: string; image: string; model: string }>,
): Promise<CharacterItem> {
	const res = await fetch(`${API_URL}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<CharacterItem>(res);
}

export async function deleteCharacter(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}

export async function uploadCharacterIcon(file: File): Promise<string> {
	const formData = new FormData();
	formData.append('iconImage', file);
	const res = await fetch(`${API_URL}/upload-icon`, {
		method: 'POST',
		body: formData,
	});
	if (res.status === 404) {
		throw new Error('El backend no tiene el endpoint /characters/upload-icon. Reinicia el backend (o recompila y vuelve a arrancarlo) para cargar los cambios.');
	}
	const payload = await ensureOk<{ icon: string }>(res);
	return (payload?.icon || '').trim();
}

export async function uploadCharacterImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append('imageFile', file);
	const res = await fetch(`${API_URL}/upload-image`, {
		method: 'POST',
		body: formData,
	});
	if (res.status === 404) {
		throw new Error('El backend no tiene el endpoint /characters/upload-image. Reinicia el backend (o recompila y vuelve a arrancarlo) para cargar los cambios.');
	}
	const payload = await ensureOk<{ image: string }>(res);
	return (payload?.image || '').trim();
}

export async function getCharacterInstances(characterId: number): Promise<CharacterItem[]> {
	const res = await fetch(`${API_URL}/${characterId}/instances`);
	return ensureOk<CharacterItem[]>(res);
}

export async function createCharacterInstance(
	characterId: number,
	data: { name: string; classId: number; raceId: number; icon?: string; image?: string; model?: string },
): Promise<CharacterItem> {
	const res = await fetch(`${API_URL}/${characterId}/instances`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<CharacterItem>(res);
}

export async function updateCharacterInstance(
	characterId: number,
	instanceId: number,
	data: Partial<{ name: string; classId: number; raceId: number | null; icon: string; image: string; model: string }>,
): Promise<CharacterItem> {
	const res = await fetch(`${API_URL}/${characterId}/instances/${instanceId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return ensureOk<CharacterItem>(res);
}

export async function deleteCharacterInstance(characterId: number, instanceId: number): Promise<void> {
	const res = await fetch(`${API_URL}/${characterId}/instances/${instanceId}`, { method: 'DELETE' });
	await ensureOk<void>(res);
}
