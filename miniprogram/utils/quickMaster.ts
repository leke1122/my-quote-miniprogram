import type { Company, Customer, Product } from "../types/entities";
import { newCustomerCode, newProductCode } from "./codes";
import { newId } from "./id";
import { getFullPayload } from "./projectData";
import {
  emptyCompanyForm,
  emptyCustomerForm,
  emptyProductForm,
  saveCompany,
  saveCustomer,
  saveProduct,
} from "./entityStore";
import type { SyncResult } from "./entityStore";

/** 从公司名生成报价单号缩写（2–4 位） */
export function guessCompanyAbbr(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "NA";
  const ascii = trimmed.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (ascii.length >= 2) return ascii.slice(0, 4);
  return trimmed.slice(0, 4).toUpperCase() || "NA";
}

export async function quickAddCompany(input: {
  name: string;
  abbr?: string;
}): Promise<{ ok: boolean; company?: Company; error?: string }> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "请填写公司名称" };
  const payload = getFullPayload();
  const form = emptyCompanyForm();
  const abbr = (input.abbr?.trim() || guessCompanyAbbr(name)).toUpperCase();
  const isFirst = payload.companies.length === 0;
  const id = newId();
  const res: SyncResult = await saveCompany({
    ...form,
    id,
    name,
    abbr,
    isDefault: isFirst,
  });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, company: getFullPayload().companies.find((c) => c.id === id) };
}

export async function quickAddCustomer(input: {
  name: string;
  contact?: string;
  phone?: string;
}): Promise<{ ok: boolean; customer?: Customer; error?: string }> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "请填写客户名称" };
  const form = emptyCustomerForm();
  const id = newId();
  const res = await saveCustomer({
    ...form,
    id,
    code: newCustomerCode(getFullPayload().customers),
    name,
    contact: input.contact?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
  });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, customer: getFullPayload().customers.find((c) => c.id === id) };
}

export async function quickAddProduct(input: {
  name: string;
  price?: number;
  unit?: string;
}): Promise<{ ok: boolean; product?: Product; error?: string }> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "请填写商品名称" };
  const form = emptyProductForm();
  const id = newId();
  const res = await saveProduct({
    ...form,
    id,
    code: newProductCode(getFullPayload().products),
    name,
    price: Number.isFinite(input.price) ? (input.price as number) : 0,
    unit: input.unit?.trim() || "件",
  });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, product: getFullPayload().products.find((p) => p.id === id) };
}
