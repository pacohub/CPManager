import { TalentItem, TalentCreate } from '../interfaces/talent';

const BASE = 'http://localhost:4000/talents';

export async function getTalents(): Promise<TalentItem[]> {
  const res = await fetch(BASE);
  return res.ok ? (await res.json()) : [];
}

export async function getTalent(id: number): Promise<TalentItem | null> {
  const res = await fetch(`${BASE}/${id}`);
  return res.ok ? (await res.json()) : null;
}

export async function createTalent(data: TalentCreate): Promise<TalentItem> {
  const res = await fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
}

export async function updateTalent(id: number, data: TalentCreate): Promise<TalentItem | null> {
  const res = await fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.ok ? (await res.json()) : null;
}

export async function deleteTalent(id: number): Promise<void> {
  await fetch(`${BASE}/${id}`, { method: 'DELETE' });
}
