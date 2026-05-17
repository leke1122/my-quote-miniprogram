import type { Customer } from "../../types/entities";
import {
  deleteCustomer,
  emptyCustomerForm,
  getCustomerById,
  saveCustomer,
} from "../../utils/entityStore";
import { showSyncResult } from "../../utils/syncToast";
import { ensureWechatSession } from "../../utils/wechatAuth";

type CustomerForm = Omit<Customer, "id">;

function trimForm(form: CustomerForm): CustomerForm {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    contact: form.contact.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    mainBusiness: form.mainBusiness.trim(),
    taxId: form.taxId.trim(),
    bankName: form.bankName.trim(),
    bankAccount: form.bankAccount.trim(),
  };
}

Page({
  data: {
    editingId: "",
    isEdit: false,
    saving: false,
    form: emptyCustomerForm() as CustomerForm,
  },

  async onLoad(query: Record<string, string | undefined>) {
    const ok = await ensureWechatSession();
    if (!ok) return;
    const id = query.id ? decodeURIComponent(query.id) : "";
    if (id) {
      const row = getCustomerById(id);
      if (!row) {
        wx.showToast({ title: "记录不存在", icon: "none" });
        setTimeout(() => wx.navigateBack(), 600);
        return;
      }
      const { id: _id, ...form } = row;
      this.setData({ editingId: _id, isEdit: true, form });
      wx.setNavigationBarTitle({ title: "编辑客户" });
      return;
    }
    this.setData({ form: emptyCustomerForm(), isEdit: false, editingId: "" });
    wx.setNavigationBarTitle({ title: "新增客户" });
  },

  onFieldInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field as keyof CustomerForm;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onCancel() {
    wx.navigateBack();
  },

  async onSave() {
    const form = trimForm(this.data.form as CustomerForm);
    if (!form.name) {
      wx.showToast({ title: "请填写客户名称", icon: "none" });
      return;
    }
    this.setData({ saving: true });
    const res = await saveCustomer({
      ...form,
      id: this.data.editingId || undefined,
      code: form.code || form.name,
    });
    this.setData({ saving: false });
    showSyncResult(res, "客户已保存");
    if (res.ok) {
      setTimeout(() => wx.navigateBack(), 400);
    }
  },

  onDelete() {
    const id = this.data.editingId;
    if (!id) return;
    wx.showModal({
      title: "删除客户",
      content: "确定删除该客户？",
      success: async (r) => {
        if (!r.confirm) return;
        this.setData({ saving: true });
        const res = await deleteCustomer(id);
        this.setData({ saving: false });
        showSyncResult(res, "已删除");
        if (res.ok) {
          setTimeout(() => wx.navigateBack(), 400);
        }
      },
    });
  },
});
