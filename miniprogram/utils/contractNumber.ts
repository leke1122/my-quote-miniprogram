import type { DataBackupPayload } from "../types/entities";

export function peekNextContractNo(payload: DataBackupPayload, yyyymmdd: string): string {
  const n = (payload.contractCounter[yyyymmdd] ?? 0) + 1;
  return `HT-${yyyymmdd}-${String(n).padStart(3, "0")}`;
}

export function commitNextContractNo(payload: DataBackupPayload, yyyymmdd: string): string {
  const n = (payload.contractCounter[yyyymmdd] ?? 0) + 1;
  payload.contractCounter[yyyymmdd] = n;
  return `HT-${yyyymmdd}-${String(n).padStart(3, "0")}`;
}
