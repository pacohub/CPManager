import { RegionItem } from '../interfaces/region';

const API_URL = 'http://localhost:4000/regions';

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

export async function getRegions(): Promise<RegionItem[]> {
  const res = await fetch(API_URL);
  return ensureOk<RegionItem[]>(res);
}

export async function createRegion(data: RegionItem | Omit<RegionItem, 'id'>): Promise<RegionItem> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return ensureOk<RegionItem>(res);
}

export async function updateRegion(id: number, data: Partial<RegionItem>): Promise<RegionItem> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return ensureOk<RegionItem>(res);
}

export async function deleteRegion(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  await ensureOk<void>(res);
}
