import { TalentTreeItem, TalentTreeCreate } from '../interfaces/talentTree';

const BASE = 'http://localhost:4000/talent-trees';

async function readJsonSafely(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function ensureOk<T>(res: Response): Promise<T> {
  const payload = await readJsonSafely(res);
  if (!res.ok) {
    const details = typeof payload === 'string' ? payload : JSON.stringify(payload);
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${details}`);
  }
  return payload as T;
}

export async function getTalentTrees(): Promise<TalentTreeItem[]> {
  const res = await fetch(BASE);
  return ensureOk<TalentTreeItem[]>(res);
}

export async function getTalentTree(id: number): Promise<TalentTreeItem | null> {
  const res = await fetch(`${BASE}/${id}`);
  return ensureOk<TalentTreeItem | null>(res);
}

export async function createTalentTree(data: TalentTreeCreate | FormData): Promise<TalentTreeItem> {
  const opts: RequestInit = { method: 'POST' };
  if (data instanceof FormData) {
    opts.body = data;
  } else {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(data);
  }
  const res = await fetch(BASE, opts);
  return ensureOk<TalentTreeItem>(res);
}

export async function updateTalentTree(id: number, data: TalentTreeCreate | FormData): Promise<TalentTreeItem | null> {
  const opts: RequestInit = { method: 'PUT' };
  if (data instanceof FormData) {
    opts.body = data;
  } else {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(data);
  }
  const res = await fetch(`${BASE}/${id}`, opts);
  return ensureOk<TalentTreeItem | null>(res);
}

export async function deleteTalentTree(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  await ensureOk<void>(res);
}

export async function setCharacterTalentTreeEnabled(characterId: number, treeId: number, enabled: boolean) {
  const res = await fetch(`http://localhost:4000/characters/${characterId}/talent-trees/${treeId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) });
  return ensureOk<any>(res);
}
