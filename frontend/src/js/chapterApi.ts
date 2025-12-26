import { Chapter } from '../interfaces/chapter';

const API_URL = 'http://localhost:4000/chapters';

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

export async function getChaptersByCampaign(campaignId: number): Promise<Chapter[]> {
  const res = await fetch(`${API_URL}?campaignId=${campaignId}`);
  return ensureOk<Chapter[]>(res);
}

export async function getAllChapters(): Promise<Chapter[]> {
  const res = await fetch(API_URL);
  return ensureOk<Chapter[]>(res);
}

export async function createChapter(data: FormData): Promise<Chapter> {
  const res = await fetch(API_URL, { method: 'POST', body: data });
  return ensureOk<Chapter>(res);
}

export async function updateChapter(id: number, data: FormData): Promise<Chapter> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', body: data });
  return ensureOk<Chapter>(res);
}

export async function deleteChapter(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  await ensureOk<void>(res);
}
