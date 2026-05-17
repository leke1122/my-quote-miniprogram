import type { Company } from "../../types/entities";
import {
  deleteCompany,
  emptyCompanyForm,
  getCompanyById,
  saveCompany,
} from "../../utils/entityStore";
import { showSyncResult } from "../../utils/syncToast";
import { ensureWechatSession } from "../../utils/wechatAuth";

type CompanyForm = Omit<Company, "id">;

function trimForm(form: CompanyForm): CompanyForm {
  return {
    name: form.name.trim(),
    abbr: form.abbr.trim(),
    contact: form.contact.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    taxId: form.taxId.trim(),
    bankName: form.bankName.trim(),
    bankCode: form.bankCode.trim(),
    logo: form.logo?.trim() ?? "",
    sealImage: form.sealImage?.trim() ?? "",
    isDefault: Boolean(form.isDefault),
  };
}

Page({
  data: {
    editingId: "",
    isEdit: false,
    saving: false,
    form: emptyCompanyForm() as CompanyForm,
  },

  async onLoad(query: Record<string, string | undefined>) {
    const ok = await ensureWechatSession();
    if (!ok) return;
    const id = query.id ? decodeURIComponent(query.id) : "";
    if (id) {
      const row = getCompanyById(id);
      if (!row) {
        wx.showToast({ title: "记录不存在", icon: "none" });
        setTimeout(() => wx.navigateBack(), 600);
        return;
      }
      const { id: _id, ...form } = row;
      this.setData({ editingId: _id, isEdit: true, form });
      wx.setNavigationBarTitle({ title: "编辑我司" });
      return;
    }
    this.setData({ form: emptyCompanyForm(), isEdit: false, editingId: "" });
    wx.setNavigationBarTitle({ title: "新增我司" });
  },

  onFieldInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field as keyof CompanyForm;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onDefaultChange(e: WechatMiniprogram.SwitchChange) {
    this.setData({ "form.isDefault": e.detail.value });
  },

  onCancel() {
    wx.navigateBack();
  },

  async onSave() {
    const form = trimForm(this.data.form as CompanyForm);
    if (!form.name) {
      wx.showToast({ title: "请填写公司名称", icon: "none" });
      return;
    }
    this.setData({ saving: true });
    const res = await saveCompany({
      ...form,
      id: this.data.editingId || undefined,
    });
    this.setData({ saving: false });
    showSyncResult(res, "公司已保存");
    if (res.ok) {
      setTimeout(() => wx.navigateBack(), 400);
    }
  },

  onDelete() {
    const id = this.data.editingId;
    if (!id) return;
    wx.showModal({
      title: "删除公司主体",
      content: "确定删除该主体？",
      success: async (r) => {
        if (!r.confirm) return;
        this.setData({ saving: true });
        const res = await deleteCompany(id);
        this.setData({ saving: false });
        showSyncResult(res, "已删除");
        if (res.ok) {
          setTimeout(() => wx.navigateBack(), 400);
        }
      },
    });
  },
});
