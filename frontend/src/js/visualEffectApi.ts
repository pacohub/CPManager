const API_URL = 'http://localhost:4000/visual-effects';

async function readJsonSafely(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function ensureOk<T>(res: Response): Promise<T> {
  const payload = await readJsonSafely(res);
  if (!res.ok) throw new Error(typeof payload === 'string' ? payload : JSON.stringify(payload));
  return payload as T;
}

export async function getVisualEffects() {
  const res = await fetch(API_URL);
  return ensureOk(res);
}

export async function createVisualEffect(data: any) {
  const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return ensureOk(res);
}

export async function updateVisualEffect(id: number, data: any) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return ensureOk(res);
}

export async function deleteVisualEffect(id: number) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return ensureOk(res);
}
