export type RequiredField = {
  key: string;
  label: string;
  validator?: (value: any) => boolean;
};

export function missingFor(entity: any, fields: RequiredField[]): string[] {
  const missing: string[] = [];
  for (const f of fields) {
    const val = entity ? entity[f.key] : undefined;
    const ok = f.validator ? f.validator(val) : defaultValidator(val);
    if (!ok) missing.push(f.label);
  }
  return missing;
}

export function hasWarning(entity: any, fields: RequiredField[]): boolean {
  return missingFor(entity, fields).length > 0;
}

export function countChildWarnings<T>(children: T[] | undefined, childHasWarning: (c: T) => boolean): number {
  if (!Array.isArray(children)) return 0;
  let c = 0;
  for (const ch of children) if (childHasWarning(ch)) c += 1;
  return c;
}

function defaultValidator(v: any) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'number') return !Number.isNaN(v);
  if (typeof v === 'boolean') return v === true || v === false;
  return true;
}
