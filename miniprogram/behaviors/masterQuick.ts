import type { Product } from "../types/entities";
import { rebuildMasterPickers, type MasterPickerHost } from "../utils/masterPicker";
import { guessCompanyAbbr, quickAddCompany, quickAddCustomer, quickAddProduct } from "../utils/quickMaster";

export const masterQuickBehavior = Behavior({
  data: {
    showQuickCompany: false,
    quickCompanyName: "",
    quickCompanyAbbr: "",
    showQuickCustomer: false,
    quickCustomerName: "",
    quickCustomerContact: "",
    quickCustomerPhone: "",
    showQuickProduct: false,
    quickProductName: "",
    quickProductPrice: "",
    quickProductUnit: "件",
    quickMasterSaving: false,
  },

  methods: {
    rebuildMasterPickers(selectCompanyId?: string, selectCustomerId?: string) {
      rebuildMasterPickers(this as unknown as MasterPickerHost, selectCompanyId, selectCustomerId);
    },

    toggleQuickCompany() {
      this.setData({ showQuickCompany: !this.data.showQuickCompany });
    },

    onQuickCompanyNameInput(e: WechatMiniprogram.Input) {
      const name = e.detail.value;
      this.setData({
        quickCompanyName: name,
        quickCompanyAbbr: this.data.quickCompanyAbbr || guessCompanyAbbr(name),
      });
    },

    onQuickCompanyAbbrInput(e: WechatMiniprogram.Input) {
      this.setData({ quickCompanyAbbr: e.detail.value.toUpperCase() });
    },

    async onSaveQuickCompany() {
      if (this.data.quickMasterSaving) return;
      this.setData({ quickMasterSaving: true });
      const res = await quickAddCompany({
        name: this.data.quickCompanyName,
        abbr: this.data.quickCompanyAbbr,
      });
      this.setData({ quickMasterSaving: false });
      if (!res.ok || !res.company) {
        wx.showToast({ title: res.error ?? "保存失败", icon: "none" });
        return;
      }
      wx.showToast({ title: "已同步至我司信息", icon: "success" });
      this.setData({
        showQuickCompany: false,
        quickCompanyName: "",
        quickCompanyAbbr: "",
      });
      rebuildMasterPickers(this as unknown as MasterPickerHost, res.company.id);
    },

    goFullCompanyEdit() {
      wx.navigateTo({ url: "/pages/company-edit/index" });
    },

    toggleQuickCustomer() {
      this.setData({ showQuickCustomer: !this.data.showQuickCustomer });
    },

    onQuickCustomerNameInput(e: WechatMiniprogram.Input) {
      this.setData({ quickCustomerName: e.detail.value });
    },

    onQuickCustomerContactInput(e: WechatMiniprogram.Input) {
      this.setData({ quickCustomerContact: e.detail.value });
    },

    onQuickCustomerPhoneInput(e: WechatMiniprogram.Input) {
      this.setData({ quickCustomerPhone: e.detail.value });
    },

    async onSaveQuickCustomer() {
      if (this.data.quickMasterSaving) return;
      this.setData({ quickMasterSaving: true });
      const res = await quickAddCustomer({
        name: this.data.quickCustomerName,
        contact: this.data.quickCustomerContact,
        phone: this.data.quickCustomerPhone,
      });
      this.setData({ quickMasterSaving: false });
      if (!res.ok || !res.customer) {
        wx.showToast({ title: res.error ?? "保存失败", icon: "none" });
        return;
      }
      wx.showToast({ title: "已同步至客户信息", icon: "success" });
      this.setData({
        showQuickCustomer: false,
        quickCustomerName: "",
        quickCustomerContact: "",
        quickCustomerPhone: "",
      });
      rebuildMasterPickers(this as unknown as MasterPickerHost, undefined, res.customer.id);
    },

    goFullCustomerEdit() {
      wx.navigateTo({ url: "/pages/customer-edit/index" });
    },

    toggleQuickProduct() {
      this.setData({ showQuickProduct: !this.data.showQuickProduct });
    },

    onQuickProductNameInput(e: WechatMiniprogram.Input) {
      this.setData({ quickProductName: e.detail.value });
    },

    onQuickProductPriceInput(e: WechatMiniprogram.Input) {
      this.setData({ quickProductPrice: e.detail.value });
    },

    onQuickProductUnitInput(e: WechatMiniprogram.Input) {
      this.setData({ quickProductUnit: e.detail.value });
    },

    async onSaveQuickProduct() {
      if (this.data.quickMasterSaving) return;
      const price = parseFloat(this.data.quickProductPrice);
      this.setData({ quickMasterSaving: true });
      const res = await quickAddProduct({
        name: this.data.quickProductName,
        price: Number.isFinite(price) ? price : 0,
        unit: this.data.quickProductUnit,
      });
      this.setData({ quickMasterSaving: false });
      if (!res.ok || !res.product) {
        wx.showToast({ title: res.error ?? "保存失败", icon: "none" });
        return;
      }
      wx.showToast({ title: "已同步至商品信息", icon: "success" });
      this.setData({
        showQuickProduct: false,
        quickProductName: "",
        quickProductPrice: "",
        quickProductUnit: "件",
        showProductPicker: true,
      });
      rebuildMasterPickers(this as unknown as MasterPickerHost);
      const host = this as unknown as { addProductLine?: (p: Product) => void };
      host.addProductLine?.(res.product);
    },

    goFullProductEdit() {
      wx.navigateTo({ url: "/pages/product-edit/index" });
    },
  },
});
