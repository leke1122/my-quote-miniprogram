import type { DataBackupPayload } from "../types/entities";

export function dateToYmdCompact(isoDate: string): string {
  return isoDate.replace(/-/g, "");
}

export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function peekNextQuoteNo(
  payload: DataBackupPayload,
  abbr: string,
  yyyymmdd: string,
): string {
  const key = `${abbr}-${yyyymmdd}`;
  const n = (payload.quoteCounter[key] ?? 0) + 1;
  return `${abbr}-${yyyymmdd}-${String(n).padStart(3, "0")}`;
}

export function commitNextQuoteNo(
  payload: DataBackupPayload,
  abbr: string,
  yyyymmdd: string,
): string {
  const key = `${abbr}-${yyyymmdd}`;
  const n = (payload.quoteCounter[key] ?? 0) + 1;
  payload.quoteCounter[key] = n;
  return `${abbr}-${yyyymmdd}-${String(n).padStart(3, "0")}`;
}
