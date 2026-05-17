export interface Product {
  id: string;
  code: string;
  name: string;
  model: string;
  spec: string;
  unit: string;
  price: number;
  image?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  mainBusiness: string;
  taxId: string;
  bankName: string;
  bankAccount: string;
}

export interface Company {
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  taxId: string;
  bankName: string;
  bankCode: string;
  logo?: string;
  sealImage?: string;
  abbr: string;
  isDefault: boolean;
}

export interface DataBackupPayload {
  version: number;
  exportedAt: string;
  app: "my-quote";
  companies: Company[];
  customers: Customer[];
  products: Product[];
  quotes: unknown[];
  quoteCounter: Record<string, number>;
  contracts: unknown[];
  contractCounter: Record<string, number>;
  settings: Record<string, string>;
}
