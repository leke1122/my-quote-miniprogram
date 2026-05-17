import type {
  Company,
  Contract,
  Customer,
  DataBackupPayload,
  Product,
  Quote,
} from "../types/entities";
import { apiRequest } from "./request";

const CACHE_KEY = "project_data_payload";
const DATA_BACKUP_VERSION = 2;

export interface ProjectDataResponse {
  ok?: boolean;
  error?: string;
  payload?: DataBackupPayload;
}

function defaultSettings(): Record<string, string> {
  return {
    wpsAppId: "",
    wpsAppSecret: "",
    wpsToken: "",
    wpsDbsheetFileId: "",
    wpsDbsheetSheetId: "",
    wpsFieldQuoteNo: "",
    wpsFieldDate: "",
    wpsFieldCustomer: "",
    wpsFieldProductName: "",
    wpsFieldModel: "",
    wpsFieldSpec: "",
    wpsFieldUnit: "",
    wpsFieldQty: "",
    wpsFieldPrice: "",
    wpsFieldAmount: "",
    feishuKbUrl: "https://www.feishu.cn/",
  };
}

export function createEmptyPayload(): DataBackupPayload {
  const now = new Date().toISOString();
  return {
    version: DATA_BACKUP_VERSION,
    exportedAt: now,
    app: "my-quote",
    companies: [],
    customers: [],
    products: [],
    quotes: [],
    quoteCounter: {},
    contracts: [],
    contractCounter: {},
    settings: defaultSettings(),
  };
}

function normalizePayload(raw: unknown): DataBackupPayload {
  const base = createEmptyPayload();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  return {
    ...base,
    version: typeof o.version === "number" ? o.version : base.version,
    exportedAt: typeof o.exportedAt === "string" ? o.exportedAt : base.exportedAt,
    app: "my-quote",
    companies: Array.isArray(o.companies) ? (o.companies as Company[]) : [],
    customers: Array.isArray(o.customers) ? (o.customers as Customer[]) : [],
    products: Array.isArray(o.products) ? (o.products as Product[]) : [],
    quotes: Array.isArray(o.quotes) ? (o.quotes as Quote[]) : [],
    quoteCounter:
      o.quoteCounter && typeof o.quoteCounter === "object"
        ? (o.quoteCounter as Record<string, number>)
        : {},
    contracts: Array.isArray(o.contracts) ? (o.contracts as Contract[]) : [],
    contractCounter:
      o.contractCounter && typeof o.contractCounter === "object"
        ? (o.contractCounter as Record<string, number>)
        : {},
    settings:
      o.settings && typeof o.settings === "object"
        ? { ...defaultSettings(), ...(o.settings as Record<string, string>) }
        : defaultSettings(),
  };
}

export function getFullPayload(): DataBackupPayload {
  try {
    const cached = wx.getStorageSync(CACHE_KEY);
    return normalizePayload(cached);
  } catch {
    return createEmptyPayload();
  }
}

export function saveCachedPayload(payload: DataBackupPayload): void {
  const next: DataBackupPayload = {
    ...payload,
    exportedAt: new Date().toISOString(),
    version: DATA_BACKUP_VERSION,
  };
  wx.setStorageSync(CACHE_KEY, next);
}

export async function pullProjectDataFromCloud(): Promise<ProjectDataResponse> {
  const res = await apiRequest<ProjectDataResponse>({
    url: "/api/project-data",
    method: "GET",
  });
  if (res.ok && res.payload) {
    saveCachedPayload(normalizePayload(res.payload));
  }
  return res;
}

export async function pushProjectDataToCloud(
  payload?: DataBackupPayload,
): Promise<{ ok: boolean; error?: string }> {
  const body = payload ?? getFullPayload();
  saveCachedPayload(body);
  try {
    const res = await apiRequest<{ ok?: boolean; error?: string }>({
      url: "/api/project-data",
      method: "PUT",
      data: { payload: body },
    });
    if (!res.ok) {
      return { ok: false, error: res.error ?? "同步失败" };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "网络异常";
    return { ok: false, error: msg };
  }
}

/** @deprecated 使用 getFullPayload */
export function getCachedProjectData(): DataBackupPayload | null {
  return getFullPayload();
}

export function getCachedCounts(): {
  products: number;
  customers: number;
  companies: number;
  quotes: number;
  contracts: number;
} {
  const p = getFullPayload();
  return {
    products: p.products.length,
    customers: p.customers.length,
    companies: p.companies.length,
    quotes: p.quotes.length,
    contracts: p.contracts.length,
  };
}
