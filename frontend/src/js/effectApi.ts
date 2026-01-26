const API_URL = 'http://localhost:4000/effects';

async function readJsonSafely(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function ensureOk<T = any>(res: Response): Promise<T> {
  const payload = await readJsonSafely(res);
  if (!res.ok) throw new Error(typeof payload === 'string' ? payload : JSON.stringify(payload));
  return payload as T;
}

export async function getEffects(): Promise<any> {
  const res = await fetch(API_URL);
  return ensureOk(res);
}

export async function getEffect(id: number): Promise<any> {
  const res = await fetch(`${API_URL}/${id}`);
  return ensureOk(res);
}

export async function createEffect(data: any): Promise<any> {
  const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return ensureOk(res);
}

export async function updateEffect(id: number, data: any): Promise<any> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return ensureOk(res);
}

export async function deleteEffect(id: number): Promise<any> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return ensureOk(res);
}

export async function uploadEffectIcon(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('iconImage', file);
  const res = await fetch(`${API_URL}/upload-icon`, { method: 'POST', body: formData });
  if (res.status === 404) {
    throw new Error('El backend no tiene el endpoint /effects/upload-icon. Reinicia el backend (o recompila y vuelve a arrancarlo) para cargar los cambios.');
  }
  const payload = await ensureOk<{ icon: string }>(res);
  return (payload?.icon || '').trim();
}
