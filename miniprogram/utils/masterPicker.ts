import type { Company, Customer } from "../types/entities";
import { getFullPayload } from "./projectData";

type PickerProduct = { id: string; label: string };

export type MasterPickerHost = {
  _companies: Company[];
  _customers: Customer[];
  data: {
    companyIndex?: number;
    customerIndex?: number;
  };
  setData: (data: Record<string, unknown>) => void;
  refreshQuoteNo?: () => void;
  refreshContractNo?: () => void;
  refreshPartySummary?: () => void;
};

export function rebuildMasterPickers(
  page: MasterPickerHost,
  selectCompanyId?: string,
  selectCustomerId?: string,
): void {
  const payload = getFullPayload();
  page._companies = payload.companies;
  page._customers = payload.customers;
  const products: PickerProduct[] = payload.products.map((p) => ({
    id: p.id,
    label: `${p.code} · ${p.name}`,
  }));

  let companyIndex = page.data.companyIndex ?? 0;
  let customerIndex = page.data.customerIndex ?? 0;
  if (selectCompanyId) {
    const i = page._companies.findIndex((c) => c.id === selectCompanyId);
    if (i >= 0) companyIndex = i;
  }
  if (selectCustomerId) {
    const i = page._customers.findIndex((c) => c.id === selectCustomerId);
    if (i >= 0) customerIndex = i;
  }

  page.setData({
    companyNames: page._companies.map((c) => c.name || c.abbr || "未命名"),
    customerNames: page._customers.map((c) => c.name || c.code || "未命名"),
    pickerProducts: products,
    companyIndex,
    customerIndex,
  });

  page.refreshQuoteNo?.();
  page.refreshContractNo?.();
  page.refreshPartySummary?.();
}
