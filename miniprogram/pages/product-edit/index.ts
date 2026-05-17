import type { Product } from "../../types/entities";
import {
  deleteProduct,
  emptyProductForm,
  getProductById,
  saveProduct,
} from "../../utils/entityStore";
import { showSyncResult } from "../../utils/syncToast";
import { chooseAndUploadProductImage } from "../../utils/uploadImage";
import { ensureWechatSession } from "../../utils/wechatAuth";

type ProductForm = Omit<Product, "id">;

Page({
  data: {
    editingId: "",
    isEdit: false,
    saving: false,
    form: emptyProductForm() as ProductForm,
    priceStr: "0",
    imagePreview: "",
    uploadingImage: false,
  },

  async onLoad(query: Record<string, string | undefined>) {
    const ok = await ensureWechatSession();
    if (!ok) return;
    const id = query.id ? decodeURIComponent(query.id) : "";
    if (id) {
      const row = getProductById(id);
      if (!row) {
        wx.showToast({ title: "记录不存在", icon: "none" });
        setTimeout(() => wx.navigateBack(), 600);
        return;
      }
      const { id: _id, ...form } = row;
      this.setData({
        editingId: _id,
        isEdit: true,
        form,
        priceStr: String(row.price ?? 0),
        imagePreview: row.image?.trim() ?? "",
      });
      wx.setNavigationBarTitle({ title: "编辑商品" });
      return;
    }
    this.setData({
      form: emptyProductForm(),
      priceStr: "0",
      isEdit: false,
      editingId: "",
      imagePreview: "",
    });
    wx.setNavigationBarTitle({ title: "新增商品" });
  },

  onFieldInput(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field as keyof ProductForm;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onPriceInput(e: WechatMiniprogram.Input) {
    this.setData({ priceStr: e.detail.value });
  },

  async onChooseImage() {
    if (this.data.uploadingImage || this.data.saving) return;
    this.setData({ uploadingImage: true });
    try {
      const url = await chooseAndUploadProductImage();
      this.setData({
        imagePreview: url,
        "form.image": url,
      });
      wx.showToast({ title: "图片已上传", icon: "success" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "上传失败";
      if (msg !== "已取消") {
        wx.showToast({ title: msg, icon: "none", duration: 2500 });
      }
    } finally {
      this.setData({ uploadingImage: false });
    }
  },

  onClearImage() {
    this.setData({ imagePreview: "", "form.image": "" });
  },

  onCancel() {
    wx.navigateBack();
  },

  async onSave() {
    const form = this.data.form as ProductForm;
    if (!form.name.trim()) {
      wx.showToast({ title: "请填写商品名称", icon: "none" });
      return;
    }
    const price = parseFloat(this.data.priceStr);
    this.setData({ saving: true });
    const res = await saveProduct({
      ...form,
      id: this.data.editingId || undefined,
      code: form.code.trim() || form.name.trim(),
      name: form.name.trim(),
      model: form.model.trim(),
      spec: form.spec.trim(),
      unit: form.unit.trim() || "件",
      price: Number.isFinite(price) ? price : 0,
      image: (this.data.imagePreview || form.image || "").trim(),
    });
    this.setData({ saving: false });
    showSyncResult(res, "商品已保存");
    if (res.ok) {
      setTimeout(() => wx.navigateBack(), 400);
    }
  },

  onDelete() {
    const id = this.data.editingId;
    if (!id) return;
    wx.showModal({
      title: "删除商品",
      content: "确定删除该商品？",
      success: async (r) => {
        if (!r.confirm) return;
        this.setData({ saving: true });
        const res = await deleteProduct(id);
        this.setData({ saving: false });
        showSyncResult(res, "已删除");
        if (res.ok) {
          setTimeout(() => wx.navigateBack(), 400);
        }
      },
    });
  },
});
