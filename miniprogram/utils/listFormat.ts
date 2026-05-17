import { getFullPayload } from "./projectData";

export interface ListRow {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  imageUrl?: string;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function str(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" && !Number.isNaN(v)) return String(v);
  return fallback;
}

function money(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `¥${n.toFixed(2)}`;
}

function sumQuoteAmount(q: Record<string, unknown>): number {
  const lines = Array.isArray(q.lines) ? q.lines : [];
  let sum = 0;
  for (const line of lines) {
    const r = asRecord(line);
    if (r) sum += Number(r.amount) || 0;
  }
  const fees = Array.isArray(q.extraFees) ? q.extraFees : [];
  for (const fee of fees) {
    const r = asRecord(fee);
    if (r) sum += Number(r.amount) || 0;
  }
  return sum;
}

function sortByTime<T>(items: T[], pick: (item: T) => string): T[] {
  return [...items].sort((a, b) => pick(b).localeCompare(pick(a)));
}

export const EMPTY_HINT = "暂无记录，可点击下方「新增」录入；保存后将自动同步到云端。";

export function mapProductRows(): ListRow[] {
  const list = getFullPayload().products;
  if (!Array.isArray(list)) return [];
  return list.map((raw, i) => {
    const p = asRecord(raw) ?? {};
    const code = str(p.code, "—");
    const name = str(p.name, "未命名商品");
    const model = [str(p.model), str(p.spec)].filter(Boolean).join(" ");
    const price = Number(p.price);
    const image = str(p.image);
    return {
      id: str(p.id, `product-${i}`),
      title: `${code} · ${name}`,
      subtitle: model || "暂无型号规格",
      meta: Number.isFinite(price) ? money(price) : "",
      imageUrl: image.startsWith("http") || image.startsWith("https") ? image : undefined,
    };
  });
}

export function mapCustomerRows(): ListRow[] {
  const list = getFullPayload().customers;
  if (!Array.isArray(list)) return [];
  return list.map((raw, i) => {
    const c = asRecord(raw) ?? {};
    const name = str(c.name, "未命名客户");
    const contact = str(c.contact);
    const phone = str(c.phone);
    const subtitle = [contact, phone].filter(Boolean).join(" · ") || str(c.address, "暂无联系方式");
    return {
      id: str(c.id, `customer-${i}`),
      title: name,
      subtitle,
      meta: str(c.code),
    };
  });
}

export function mapCompanyRows(): ListRow[] {
  const list = getFullPayload().companies;
  if (!Array.isArray(list)) return [];
  return list.map((raw, i) => {
    const c = asRecord(raw) ?? {};
    const name = str(c.name, "未命名主体");
    const phone = str(c.phone);
    const isDefault = c.isDefault === true;
    return {
      id: str(c.id, `company-${i}`),
      title: name,
      subtitle: phone || str(c.address, "暂无电话"),
      meta: isDefault ? "默认" : str(c.abbr),
    };
  });
}

export function mapQuoteRows(): ListRow[] {
  const list = getFullPayload().quotes;
  if (!Array.isArray(list)) return [];
  const sorted = sortByTime(list, (raw) => {
    const q = asRecord(raw) ?? {};
    return str(q.updatedAt) || str(q.date);
  });
  return sorted.map((raw, i) => {
    const q = asRecord(raw) ?? {};
    const lines = Array.isArray(q.lines) ? q.lines.length : 0;
    const total = sumQuoteAmount(q);
    const date = str(q.date) || str(q.updatedAt).slice(0, 10);
    return {
      id: str(q.id, `quote-${i}`),
      title: str(q.quoteNo, "无单号"),
      subtitle: date ? `日期 ${date} · ${lines} 行明细` : `${lines} 行明细`,
      meta: money(total),
    };
  });
}

export function mapContractRows(): ListRow[] {
  const list = getFullPayload().contracts;
  if (!Array.isArray(list)) return [];
  const sorted = sortByTime(list, (raw) => {
    const c = asRecord(raw) ?? {};
    return str(c.updatedAt) || str(c.signingDate);
  });
  return sorted.map((raw, i) => {
    const c = asRecord(raw) ?? {};
    const lines = Array.isArray(c.lines) ? c.lines.length : 0;
    const signingDate = str(c.signingDate);
    const buyer = asRecord(c.buyer);
    return {
      id: str(c.id, `contract-${i}`),
      title: str(c.contractNo, "无合同号"),
      subtitle: signingDate ? `签订 ${signingDate} · ${lines} 行明细` : `${lines} 行明细`,
      meta: str(buyer?.name),
    };
  });
}
