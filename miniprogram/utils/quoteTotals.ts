import type { QuoteExtraFee, QuoteLine } from "../types/entities";

export function calcLineAmount(price: number, qty: number): number {
  return Math.round(price * qty * 100) / 100;
}

export function quoteSubtotal(lines: QuoteLine[]): number {
  return lines.reduce((s, l) => s + l.amount, 0);
}

export function quoteTax(sub: number, taxIncluded: boolean, taxRate: number): number {
  if (!taxIncluded) return 0;
  return Math.round(sub * (taxRate / 100) * 100) / 100;
}

export function quoteGrandTotal(
  lines: QuoteLine[],
  taxIncluded: boolean,
  taxRate: number,
  extraFees: QuoteExtraFee[],
): number {
  const sub = quoteSubtotal(lines);
  const tax = quoteTax(sub, taxIncluded, taxRate);
  const extra = extraFees.reduce((s, f) => s + f.amount, 0);
  return Math.round((sub + tax + extra) * 100) / 100;
}

export function contractSubtotal(lines: { amount: number }[]): number {
  return lines.reduce((s, l) => s + l.amount, 0);
}

export function contractGrandTotal(
  lines: { amount: number }[],
  taxIncluded: boolean,
  taxRate: number,
  extraFees: QuoteExtraFee[],
): number {
  const sub = contractSubtotal(lines);
  const tax = quoteTax(sub, taxIncluded, taxRate);
  const extra = extraFees.reduce((s, f) => s + f.amount, 0);
  return Math.round((sub + tax + extra) * 100) / 100;
}
