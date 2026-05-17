import type { Quote } from "../types/entities";
import { newId } from "./id";
import { getFullPayload, pushProjectDataToCloud } from "./projectData";
import type { SyncResult } from "./entityStore";

export function getQuotes(): Quote[] {
  return getFullPayload().quotes;
}

export function getQuoteById(id: string): Quote | undefined {
  return getQuotes().find((q) => q.id === id);
}

export async function saveQuote(quote: Quote, options?: { allocateNo?: boolean }): Promise<SyncResult> {
  const payload = getFullPayload();
  const idx = payload.quotes.findIndex((q) => q.id === quote.id);
  if (idx >= 0) {
    payload.quotes[idx] = quote;
  } else {
    payload.quotes.push(quote);
  }
  if (options?.allocateNo) {
    void options;
  }
  return pushProjectDataToCloud(payload);
}

export async function deleteQuote(id: string): Promise<SyncResult> {
  const payload = getFullPayload();
  payload.quotes = payload.quotes.filter((q) => q.id !== id);
  return pushProjectDataToCloud(payload);
}

export function createEmptyQuoteId(): string {
  return newId();
}
