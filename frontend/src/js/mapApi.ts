import { MapItem } from '../interfaces/map';
import { ComponentItem } from '../interfaces/component';

const API_URL = 'http://localhost:4000/maps';

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

export async function getMaps(): Promise<MapItem[]> {
  const res = await fetch(API_URL);
  return ensureOk<MapItem[]>(res);
}

export async function getMap(id: number): Promise<MapItem> {
  const res = await fetch(`${API_URL}/${id}`);
  return ensureOk<MapItem>(res);
}

export async function createMap(data: FormData): Promise<MapItem> {
  const res = await fetch(API_URL, { method: 'POST', body: data });
  return ensureOk<MapItem>(res);
}

export async function updateMap(id: number, data: FormData): Promise<MapItem> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', body: data });
  return ensureOk<MapItem>(res);
}

export async function deleteMap(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  await ensureOk<void>(res);
}

export async function getMapComponents(mapId: number): Promise<ComponentItem[]> {
  const res = await fetch(`${API_URL}/${mapId}/components`);
  return ensureOk<ComponentItem[]>(res);
}

export async function setMapComponents(mapId: number, componentIds: number[]): Promise<MapItem> {
  const res = await fetch(`${API_URL}/${mapId}/components`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ componentIds }),
  });
  return ensureOk<MapItem>(res);
}
