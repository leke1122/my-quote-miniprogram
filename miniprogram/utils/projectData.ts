import { apiRequest } from "./request";

const CACHE_KEY = "project_data_payload";

export interface ProjectDataResponse {
  ok?: boolean;
  error?: string;
  payload?: {
    products?: unknown[];
    customers?: unknown[];
    companies?: unknown[];
    quotes?: unknown[];
    contracts?: unknown[];
  };
}

export async function pullProjectDataFromCloud(): Promise<ProjectDataResponse> {
  const res = await apiRequest<ProjectDataResponse>({
    url: "/api/project-data",
    method: "GET",
  });
  if (res.ok && res.payload) {
    wx.setStorageSync(CACHE_KEY, res.payload);
  }
  return res;
}

export function getCachedProjectData(): ProjectDataResponse["payload"] | null {
  try {
    return wx.getStorageSync(CACHE_KEY) as ProjectDataResponse["payload"];
  } catch {
    return null;
  }
}

export function getCachedCounts(): {
  products: number;
  customers: number;
  companies: number;
  quotes: number;
  contracts: number;
} {
  const p = getCachedProjectData();
  return {
    products: Array.isArray(p?.products) ? p.products.length : 0,
    customers: Array.isArray(p?.customers) ? p.customers.length : 0,
    companies: Array.isArray(p?.companies) ? p.companies.length : 0,
    quotes: Array.isArray(p?.quotes) ? p.quotes.length : 0,
    contracts: Array.isArray(p?.contracts) ? p.contracts.length : 0,
  };
}
