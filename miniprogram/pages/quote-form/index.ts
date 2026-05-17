import type { Company, Customer, Quote, QuoteLine } from "../../types/entities";
import { getCompanyById, getProductById } from "../../utils/entityStore";
import { newId } from "../../utils/id";
import { getFullPayload, pushProjectDataToCloud } from "../../utils/projectData";
import {
  commitNextQuoteNo,
  dateToYmdCompact,
  peekNextQuoteNo,
  todayIso,
} from "../../utils/quoteNumber";
import { createEmptyQuoteId, deleteQuote, getQuoteById } from "../../utils/quoteStore";
import {
  calcLineAmount,
  quoteGrandTotal,
  quoteSubtotal,
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
    quoteNo: "",
    date: todayIso(),
    companyIndex: 0,
    customerIndex: 0,
    companyNames: [] as string[],
    customerNames: [] as string[],
    lines: [] as QuoteLine[],
    showProductPicker: false,
    pickerProducts: [] as PickerProduct[],
    taxIncluded: false,
    taxRateStr: "13",
    subtotalStr: "0.00",
    taxStr: "0.00",
    grandStr: "0.00",
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
      const q = getQuoteById(id);
      if (!q) {
        wx.showToast({ title: "报价不存在", icon: "none" });
        setTimeout(() => wx.navigateBack(), 600);
        return;
      }
      this.applyQuote(q);
      wx.setNavigationBarTitle({ title: "编辑报价" });
      return;
    }
    this.initNewQuote();
    wx.setNavigationBarTitle({ title: "新建报价" });
  },

  companyId(): string {
    const c = this._companies[this.data.companyIndex];
    return c?.id ?? "";
  },

  customerId(): string {
    const c = this._customers[this.data.customerIndex];
    return c?.id ?? "";
  },

  initNewQuote() {
    const defIdx = Math.max(
      0,
      this._companies.findIndex((c) => c.isDefault),
    );
    const company = this._companies[defIdx];
    const abbr = (company?.abbr || "NA").toUpperCase();
    const ymd = dateToYmdCompact(this.data.date);
    const payload = getFullPayload();
    const quoteNo = peekNextQuoteNo(payload, abbr, ymd);
    this.setData({
      editingId: "",
      isEdit: false,
      companyIndex: defIdx >= 0 ? defIdx : 0,
      customerIndex: 0,
      quoteNo,
      date: todayIso(),
      lines: [],
      taxIncluded: false,
      taxRateStr: "13",
    });
    this.refreshTotals();
  },

  applyQuote(q: Quote) {
    const companyIndex = Math.max(0, this._companies.findIndex((c) => c.id === q.companyId));
    const customerIndex = Math.max(0, this._customers.findIndex((c) => c.id === q.customerId));
    this.setData({
      editingId: q.id,
      isEdit: true,
      quoteNo: q.quoteNo,
      date: q.date,
      companyIndex,
      customerIndex,
      lines: q.lines,
      taxIncluded: q.taxIncluded,
      taxRateStr: String(q.taxRate ?? 13),
    });
    this.refreshTotals();
  },

  refreshQuoteNo() {
    if (this.data.isEdit) return;
    const company = this._companies[this.data.companyIndex];
    if (!company) return;
    const abbr = (company.abbr || "NA").toUpperCase();
    const ymd = dateToYmdCompact(this.data.date);
    const quoteNo = peekNextQuoteNo(getFullPayload(), abbr, ymd);
    this.setData({ quoteNo });
  },

  refreshTotals() {
    const lines = this.data.lines;
    const taxRate = parseFloat(this.data.taxRateStr) || 0;
    const sub = quoteSubtotal(lines);
    const tax = quoteTax(sub, this.data.taxIncluded, taxRate);
    const grand = quoteGrandTotal(lines, this.data.taxIncluded, taxRate, []);
    this.setData({
      subtotalStr: sub.toFixed(2),
      taxStr: tax.toFixed(2),
      grandStr: grand.toFixed(2),
    });
  },

  onQuoteNoInput(e: WechatMiniprogram.Input) {
    this.setData({ quoteNo: e.detail.value });
  },

  onDateChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ date: e.detail.value as string });
    this.refreshQuoteNo();
  },

  onCompanyChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ companyIndex: Number(e.detail.value) });
    this.refreshQuoteNo();
  },

  onCustomerChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ customerIndex: Number(e.detail.value) });
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

  addProductLine(p: { id: string; code: string; name: string; model: string; spec: string; unit: string; price: number; image?: string }) {
    const line: QuoteLine = {
      id: newId(),
      productId: p.id,
      code: p.code,
      name: p.name,
      model: p.model,
      spec: p.spec,
      unit: p.unit,
      price: p.price,
      qty: 1,
      amount: calcLineAmount(p.price, 1),
      image: p.image,
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
    const abbr = (company.abbr || "NA").toUpperCase();
    const ymd = dateToYmdCompact(this.data.date);
    const payload = getFullPayload();
    const now = new Date().toISOString();
    let quoteNo = this.data.quoteNo.trim();
    let id = this.data.editingId;

    if (!id) {
      const preview = peekNextQuoteNo(payload, abbr, ymd);
      quoteNo = !quoteNo || quoteNo === preview ? commitNextQuoteNo(payload, abbr, ymd) : quoteNo;
      id = createEmptyQuoteId();
    }

    const quote: Quote = {
      id,
      quoteNo,
      date: this.data.date,
      companyId,
      customerId,
      lines: this.data.lines,
      taxIncluded: this.data.taxIncluded,
      taxRate: parseFloat(this.data.taxRateStr) || 0,
      extraFees: [],
      terms: [],
      showSeal: false,
      createdAt: this.data.isEdit ? (getQuoteById(id)?.createdAt ?? now) : now,
      updatedAt: now,
    };

    const idx = payload.quotes.findIndex((q) => q.id === id);
    if (idx >= 0) {
      payload.quotes[idx] = quote;
    } else {
      payload.quotes.push(quote);
    }

    this.setData({ saving: true });
    const res = await pushProjectDataToCloud(payload);
    this.setData({ saving: false });
    showSyncResult(res, "报价已保存");
    if (res.ok) {
      setTimeout(() => wx.navigateBack(), 400);
    }
  },

  onDelete() {
    const id = this.data.editingId;
    if (!id) return;
    wx.showModal({
      title: "删除报价",
      content: "确定删除该报价单？",
      success: async (r) => {
        if (!r.confirm) return;
        this.setData({ saving: true });
        const res = await deleteQuote(id);
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
