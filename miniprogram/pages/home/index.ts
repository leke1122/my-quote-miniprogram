import { getCachedCounts } from "../../utils/projectData";
import { ensureWechatSession } from "../../utils/wechatAuth";

const modules = [
  {
    title: "商品信息",
    tag: "资料库",
    desc: "编码、名称、型号规格、单价与商品图",
    url: "/pages/products/index",
  },
  {
    title: "我司信息",
    tag: "主体",
    desc: "公司抬头、签章、Logo 与银行账户",
    url: "/pages/company/index",
  },
  {
    title: "客户信息",
    tag: "档案",
    desc: "联系人、电话地址与开票信息",
    url: "/pages/customers/index",
  },
  {
    title: "历史报价",
    tag: "报价",
    desc: "查询、筛选、导出与转合同",
    url: "/pages/quote-list/index",
  },
  {
    title: "历史合同",
    tag: "合同",
    desc: "列表管理、签章预览与导出",
    url: "/pages/contract-list/index",
  },
] as const;

Page({
  data: {
    modules,
    searchQuery: "",
    syncHint: "",
  },

  async onShow() {
    const ok = await ensureWechatSession();
    if (!ok) return;
    const c = getCachedCounts();
    const total = c.products + c.customers + c.quotes + c.contracts;
    this.setData({
      syncHint: total > 0 ? "已缓存云端数据，可在各模块中继续开发列表页" : "请在「设置」中点击「从云端拉取数据」",
    });
  },

  onSearchInput(e: WechatMiniprogram.Input) {
    this.setData({ searchQuery: e.detail.value });
  },
  onSearchConfirm() {
    const q = this.data.searchQuery.trim();
    if (!q) return;
    wx.showToast({ title: "全局搜索开发中", icon: "none" });
  },
  onModuleTap(e: WechatMiniprogram.TouchEvent) {
    const url = e.currentTarget.dataset.url as string;
    if (url) wx.navigateTo({ url });
  },
});
