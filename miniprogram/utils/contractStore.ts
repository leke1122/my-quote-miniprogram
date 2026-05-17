import type { Contract } from "../types/entities";
import { newId } from "./id";
import { getFullPayload, pushProjectDataToCloud } from "./projectData";
import type { SyncResult } from "./entityStore";

export function getContracts(): Contract[] {
  return getFullPayload().contracts;
}

export function getContractById(id: string): Contract | undefined {
  return getContracts().find((c) => c.id === id);
}

export async function saveContract(contract: Contract): Promise<SyncResult> {
  const payload = getFullPayload();
  const idx = payload.contracts.findIndex((c) => c.id === contract.id);
  if (idx >= 0) {
    payload.contracts[idx] = contract;
  } else {
    payload.contracts.push(contract);
  }
  return pushProjectDataToCloud(payload);
}

export async function deleteContract(id: string): Promise<SyncResult> {
  const payload = getFullPayload();
  payload.contracts = payload.contracts.filter((c) => c.id !== id);
  return pushProjectDataToCloud(payload);
}

export function createEmptyContractId(): string {
  return newId();
}
