import type { Company, Contract, ContractLine, Customer } from "../../types/entities";
import { getCompanyById, getCustomerById, getProductById } from "../../utils/entityStore";
import { newId } from "../../utils/id";
import { partyFromCompany, partyFromCustomer } from "../../utils/partyFromMasters";
import { getFullPayload, pushProjectDataToCloud } from "../../utils/projectData";
import {
  commitNextContractNo,
  peekNextContractNo,
} from "../../utils/contractNumber";
import { dateToYmdCompact, todayIso } from "../../utils/quoteNumber";
import { createEmptyContractId, deleteContract, getContractById } from "../../utils/contractStore";
import {
  calcLineAmount,
  contractGrandTotal,
  contractSubtotal,
  quoteTax,
} from "../../utils/quoteTotals";
import { showSyncResult } from "../../utils/syncToast";
import { ensureWechatSession } from "../../utils/wechatAuth";
import { masterQuickBehavior } from "../../behaviors/masterQuick";
import { rebuildMasterPickers } from "../../utils/masterPicker";

type PickerProduct = { id: string; label: string };

Page({
  behaviors: [masterQuickBehavior],

  data: {
    editingId: "",
    isEdit: false,
    saving: false,
    contractNo: "",
    signingDate: todayIso(),
    signingPlace: "",
    companyIndex: 0,
    customerIndex: 0,
    companyNames: [] as string[],
    customerNames: [] as string[],
    lines: [] as ContractLine[],
    showProductPicker: false,
    pickerProducts: [] as PickerProduct[],
    taxIncluded: false,
    taxRateStr: "13",
    subtotalStr: "0.00",
    taxStr: "0.00",
    grandStr: "0.00",
    partySummary: "",
  },

  _companies: [] as Company[],
  _customers: [] as Customer[],

  onShow() {
    rebuildMasterPickers(this, this.companyId(), this.customerId());
  },

  async onLoad(query: Record<string, string | undefined>) {
    const ok = await ensureWechatSession();
    if (!ok) return;
    rebuildMasterPickers(this);
    const id = query.id ? decodeURIComponent(query.id) : "";
    if (id) {
      const c = getContractById(id);
      if (!c) {
        wx.showToast({ title: "合同不存在", icon: "none" });
        setTimeout(() => wx.navigateBack(), 600);
        return;
      }
      this.applyContract(c);
      wx.setNavigationBarTitle({ title: "编辑合同" });
      return;
    }
    this.initNewContract();
    wx.setNavigationBarTitle({ title: "新建合同" });
  },

  companyId(): string {
    return this._companies[this.data.companyIndex]?.id ?? "";
  },

  customerId(): string {
    return this._customers[this.data.customerIndex]?.id ?? "";
  },

  refreshPartySummary() {
    const customer = getCustomerById(this.customerId());
    const company = getCompanyById(this.companyId());
    if (!customer || !company) {
      this.setData({ partySummary: "" });
      return;
    }
    this.setData({
      partySummary: `甲方：${customer.name} · 乙方：${company.name}`,
    });
  },

  initNewContract() {
    const defIdx = Math.max(0, this._companies.findIndex((c) => c.isDefault));
    const ymd = dateToYmdCompact(todayIso());
    const contractNo = peekNextContractNo(getFullPayload(), ymd);
    this.setData({
      editingId: "",
      isEdit: false,
      companyIndex: defIdx >= 0 ? defIdx : 0,
      customerIndex: 0,
      contractNo,
      signingDate: todayIso(),
      signingPlace: "",
      lines: [],
      taxIncluded: false,
      taxRateStr: "13",
    });
    this.refreshPartySummary();
    this.refreshTotals();
  },

  applyContract(c: Contract) {
    const companyIndex = Math.max(0, this._companies.findIndex((x) => x.id === c.companyId));
    const customerIndex = Math.max(0, this._customers.findIndex((x) => x.id === c.customerId));
    this.setData({
      editingId: c.id,
      isEdit: true,
      contractNo: c.contractNo,
      signingDate: c.signingDate,
      signingPlace: c.signingPlace,
      companyIndex,
      customerIndex,
      lines: c.lines,
      taxIncluded: c.taxIncluded === true,
      taxRateStr: String(c.taxRate ?? 13),
    });
    this.refreshPartySummary();
    this.refreshTotals();
  },

  refreshContractNo() {
    if (this.data.isEdit) return;
    const ymd = dateToYmdCompact(this.data.signingDate);
    this.setData({ contractNo: peekNextContractNo(getFullPayload(), ymd) });
  },

  refreshTotals() {
    const lines = this.data.lines;
    const taxRate = parseFloat(this.data.taxRateStr) || 0;
    const sub = contractSubtotal(lines);
    const tax = quoteTax(sub, this.data.taxIncluded, taxRate);
    const grand = contractGrandTotal(lines, this.data.taxIncluded, taxRate, []);
    this.setData({
      subtotalStr: sub.toFixed(2),
      taxStr: tax.toFixed(2),
      grandStr: grand.toFixed(2),
    });
  },

  onContractNoInput(e: WechatMiniprogram.Input) {
    this.setData({ contractNo: e.detail.value });
  },

  onDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ signingDate: e.detail.value as string });
    this.refreshContractNo();
  },

  onPlaceInput(e: WechatMiniprogram.Input) {
    this.setData({ signingPlace: e.detail.value });
  },

  onCompanyChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ companyIndex: Number(e.detail.value) });
    this.refreshPartySummary();
  },

  onCustomerChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ customerIndex: Number(e.detail.value) });
    this.refreshPartySummary();
  },

  onTaxSwitch(e: WechatMiniprogram.SwitchChange) {
    this.setData({ taxIncluded: e.detail.value });
    this.refreshTotals();
  },

  onTaxRateInput(e: WechatMiniprogram.Input) {
    this.setData({ taxRateStr: e.detail.value });
    this.refreshTotals();
  },

  toggleProductPicker() {
    this.setData({ showProductPicker: !this.data.showProductPicker });
  },

  addProductLine(p: { id: string; code: string; name: string; model: string; spec: string; unit: string; price: number }) {
    const modelSpec = [p.model, p.spec].filter(Boolean).join(" ");
    const line: ContractLine = {
      id: newId(),
      productCode: p.code,
      name: p.name,
      modelSpec,
      unit: p.unit,
      qty: 1,
      price: p.price,
      amount: calcLineAmount(p.price, 1),
      remark: "",
    };
    this.setData({ lines: [...this.data.lines, line] });
    this.refreshTotals();
  },

  onAddProduct(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const p = getProductById(id);
    if (!p) return;
    this.addProductLine(p);
    this.setData({ showProductPicker: false });
  },

  onLineQtyInput(e: WechatMiniprogram.Input) {
    const id = e.currentTarget.dataset.id as string;
    const qty = parseFloat(e.detail.value) || 0;
    const lines = this.data.lines.map((l) => {
      if (l.id !== id) return l;
      return { ...l, qty, amount: calcLineAmount(l.price, qty) };
    });
    this.setData({ lines });
    this.refreshTotals();
  },

  onLinePriceInput(e: WechatMiniprogram.Input) {
    const id = e.currentTarget.dataset.id as string;
    const price = parseFloat(e.detail.value) || 0;
    const lines = this.data.lines.map((l) => {
      if (l.id !== id) return l;
      return { ...l, price, amount: calcLineAmount(price, l.qty) };
    });
    this.setData({ lines });
    this.refreshTotals();
  },

  onRemoveLine(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    this.setData({ lines: this.data.lines.filter((l) => l.id !== id) });
    this.refreshTotals();
  },

  async onSave() {
    const companyId = this.companyId();
    const customerId = this.customerId();
    if (!companyId) {
      wx.showToast({ title: "请先添加我司信息", icon: "none" });
      return;
    }
    if (!customerId) {
      wx.showToast({ title: "请先添加客户", icon: "none" });
      return;
    }
    if (this.data.lines.length === 0) {
      wx.showToast({ title: "请添加商品明细", icon: "none" });
      return;
    }
    const company = getCompanyById(companyId)!;
    const customer = getCustomerById(customerId)!;
    const ymd = dateToYmdCompact(this.data.signingDate);
    const payload = getFullPayload();
    const now = new Date().toISOString();
    let contractNo = this.data.contractNo.trim();
    let id = this.data.editingId;

    if (!id) {
      const preview = peekNextContractNo(payload, ymd);
      contractNo =
        !contractNo || contractNo === preview ? commitNextContractNo(payload, ymd) : contractNo;
      id = createEmptyContractId();
    }

    const contract: Contract = {
      id,
      contractNo,
      signingDate: this.data.signingDate,
      signingPlace: this.data.signingPlace.trim(),
      companyId,
      customerId,
      lines: this.data.lines,
      clauses: ["依双方约定执行。"],
      buyer: partyFromCustomer(customer),
      seller: partyFromCompany(company),
      taxIncluded: this.data.taxIncluded,
      taxRate: parseFloat(this.data.taxRateStr) || 0,
      extraFees: [],
      createdAt: this.data.isEdit ? (getContractById(id)?.createdAt ?? now) : now,
      updatedAt: now,
    };

    const idx = payload.contracts.findIndex((c) => c.id === id);
    if (idx >= 0) {
      payload.contracts[idx] = contract;
    } else {
      payload.contracts.push(contract);
    }

    this.setData({ saving: true });
    const res = await pushProjectDataToCloud(payload);
    this.setData({ saving: false });
    showSyncResult(res, "合同已保存");
    if (res.ok) {
      setTimeout(() => wx.navigateBack(), 400);
    }
  },

  onDelete() {
    const id = this.data.editingId;
    if (!id) return;
    wx.showModal({
      title: "删除合同",
      content: "确定删除该合同？",
      success: async (r) => {
        if (!r.confirm) return;
        this.setData({ saving: true });
        const res = await deleteContract(id);
        this.setData({ saving: false });
        showSyncResult(res, "已删除");
        if (res.ok) setTimeout(() => wx.navigateBack(), 400);
      },
    });
  },

  onCancel() {
    wx.navigateBack();
  },
});
