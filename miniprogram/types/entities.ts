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

export interface QuoteLine {
  id: string;
  productId?: string;
  code: string;
  name: string;
  model: string;
  spec: string;
  unit: string;
  price: number;
  qty: number;
  amount: number;
  image?: string;
  remark?: string;
}

export interface QuoteExtraFee {
  id: string;
  name: string;
  amount: number;
}

export interface Quote {
  id: string;
  quoteNo: string;
  date: string;
  companyId: string;
  customerId: string;
  lines: QuoteLine[];
  taxIncluded: boolean;
  taxRate: number;
  extraFees: QuoteExtraFee[];
  terms: string[];
  showSeal?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContractPartySnapshot {
  name: string;
  address: string;
  agent: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  taxId: string;
}

export interface ContractLine {
  id: string;
  productCode: string;
  name: string;
  modelSpec: string;
  unit: string;
  qty: number;
  price: number;
  amount: number;
  remark: string;
}

export interface Contract {
  id: string;
  contractNo: string;
  signingDate: string;
  signingPlace: string;
  companyId: string;
  customerId: string;
  lines: ContractLine[];
  clauses: string[];
  buyer: ContractPartySnapshot;
  seller: ContractPartySnapshot;
  taxIncluded?: boolean;
  taxRate?: number;
  extraFees?: QuoteExtraFee[];
  sourceQuoteId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataBackupPayload {
  version: number;
  exportedAt: string;
  app: "my-quote";
  companies: Company[];
  customers: Customer[];
  products: Product[];
  quotes: Quote[];
  quoteCounter: Record<string, number>;
  contracts: Contract[];
  contractCounter: Record<string, number>;
  settings: Record<string, string>;
}
