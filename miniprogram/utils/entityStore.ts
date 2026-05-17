import type { Company, Customer, DataBackupPayload, Product } from "../types/entities";
import { newCustomerCode, newProductCode } from "./codes";
import { newId } from "./id";
import { getFullPayload, pushProjectDataToCloud, saveCachedPayload } from "./projectData";

export type SyncResult = { ok: boolean; error?: string };

async function commit(payload: DataBackupPayload): Promise<SyncResult> {
  return pushProjectDataToCloud(payload);
}

export function getProductById(id: string): Product | undefined {
  return getFullPayload().products.find((p) => p.id === id);
}

export function getCustomerById(id: string): Customer | undefined {
  return getFullPayload().customers.find((c) => c.id === id);
}

export function getCompanyById(id: string): Company | undefined {
  return getFullPayload().companies.find((c) => c.id === id);
}

export async function saveProduct(input: Omit<Product, "id"> & { id?: string }): Promise<SyncResult> {
  const payload = getFullPayload();
  const id = input.id ?? newId();
  const product: Product = { ...input, id };
  const idx = payload.products.findIndex((p) => p.id === id);
  if (idx >= 0) {
    payload.products[idx] = product;
  } else {
    payload.products.push(product);
  }
  return commit(payload);
}

export async function deleteProduct(id: string): Promise<SyncResult> {
  const payload = getFullPayload();
  payload.products = payload.products.filter((p) => p.id !== id);
  return commit(payload);
}

export function emptyProductForm(): Omit<Product, "id"> {
  const payload = getFullPayload();
  return {
    code: newProductCode(payload.products),
    name: "",
    model: "",
    spec: "",
    unit: "件",
    price: 0,
    image: "",
  };
}

export async function saveCustomer(
  input: Omit<Customer, "id"> & { id?: string },
): Promise<SyncResult> {
  const payload = getFullPayload();
  const id = input.id ?? newId();
  const customer: Customer = { ...input, id };
  const idx = payload.customers.findIndex((c) => c.id === id);
  if (idx >= 0) {
    payload.customers[idx] = customer;
  } else {
    payload.customers.push(customer);
  }
  return commit(payload);
}

export async function deleteCustomer(id: string): Promise<SyncResult> {
  const payload = getFullPayload();
  payload.customers = payload.customers.filter((c) => c.id !== id);
  return commit(payload);
}

export function emptyCustomerForm(): Omit<Customer, "id"> {
  const payload = getFullPayload();
  return {
    code: newCustomerCode(payload.customers),
    name: "",
    contact: "",
    phone: "",
    address: "",
    mainBusiness: "",
    taxId: "",
    bankName: "",
    bankAccount: "",
  };
}

export async function saveCompany(input: Omit<Company, "id"> & { id?: string }): Promise<SyncResult> {
  const payload = getFullPayload();
  const id = input.id ?? newId();
  const company: Company = { ...input, id };
  if (!input.id && payload.companies.length === 0) {
    company.isDefault = true;
  }
  const idx = payload.companies.findIndex((c) => c.id === id);
  if (idx >= 0) {
    payload.companies[idx] = company;
  } else {
    payload.companies.push(company);
  }
  if (company.isDefault) {
    payload.companies = payload.companies.map((c) => ({
      ...c,
      isDefault: c.id === id,
    }));
  }
  return commit(payload);
}

export async function deleteCompany(id: string): Promise<SyncResult> {
  const payload = getFullPayload();
  const removed = payload.companies.find((c) => c.id === id);
  payload.companies = payload.companies.filter((c) => c.id !== id);
  if (removed?.isDefault && payload.companies.length > 0) {
    payload.companies[0].isDefault = true;
  }
  saveCachedPayload(payload);
  return commit(payload);
}

export function emptyCompanyForm(): Omit<Company, "id"> {
  const payload = getFullPayload();
  return {
    name: "",
    contact: "",
    phone: "",
    address: "",
    taxId: "",
    bankName: "",
    bankCode: "",
    logo: "",
    sealImage: "",
    abbr: "",
    isDefault: payload.companies.length === 0,
  };
}
