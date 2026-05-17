import type { Customer, Product } from "../types/entities";

export function newProductCode(existing: Product[]): string {
  const n = existing.length + 1;
  return `P${String(n).padStart(5, "0")}`;
}

export function newCustomerCode(existing: Customer[]): string {
  const n = existing.length + 1;
  return `C${String(n).padStart(5, "0")}`;
}
