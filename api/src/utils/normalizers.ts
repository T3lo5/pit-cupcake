export function toCents(input: unknown): number {
  if (input == null) return 0;
  if (typeof input === 'number') {
    return Math.max(0, Math.round(input * 100));
  }
  let s = String(input).trim();
  if (!s) return 0;
  s = s.replace(/\s+/g, '').replace(',', '.');
  const n = Number(s);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.round(n * 100));
}

export function toInt(input: unknown): number {
  const n = Math.floor(Number(input) || 0);
  return Math.max(0, n);
}

export function normStr(s: unknown): string {
  return String(s ?? '').trim();
}

export function normNullableStr(s: unknown): string | null {
  const v = String(s ?? '').trim();
  return v ? v : null;
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
