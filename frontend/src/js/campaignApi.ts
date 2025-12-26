import { Campaign } from '../interfaces/campaign';

const API_URL = 'http://localhost:4000/campaigns';

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

export async function getCampaignsBySaga(sagaId: number): Promise<Campaign[]> {
  const res = await fetch(`${API_URL}?sagaId=${sagaId}`);
  return ensureOk<Campaign[]>(res);
}

export async function getCampaign(id: number): Promise<Campaign> {
  const res = await fetch(`${API_URL}/${id}`);
  return ensureOk<Campaign>(res);
}

export async function createCampaign(data: FormData): Promise<Campaign> {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: data,
  });
  return ensureOk<Campaign>(res);
}

export async function updateCampaign(id: number, data: FormData): Promise<Campaign> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    body: data,
  });
  return ensureOk<Campaign>(res);
}

export async function deleteCampaign(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  await ensureOk<void>(res);
}
