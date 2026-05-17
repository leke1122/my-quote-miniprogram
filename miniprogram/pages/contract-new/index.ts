import { getContracts } from "../../utils/contractStore";
import { setTabBarSelected } from "../../utils/tabBar";
import { ensureWechatSession } from "../../utils/wechatAuth";

Page({
  data: {
    recent: [] as { id: string; title: string; subtitle: string; meta: string }[],
  },

  onGoHome() {
    wx.reLaunch({ url: "/pages/home/index" });
  },

  onNew() {
    wx.navigateTo({ url: "/pages/contract-form/index" });
  },

  onOpen(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    if (id) {
      wx.navigateTo({ url: `/pages/contract-form/index?id=${encodeURIComponent(id)}` });
    }
  },

  onAllList() {
    wx.navigateTo({ url: "/pages/contract-list/index" });
  },

  loadRecent() {
    const contracts = [...getContracts()].sort((a, b) =>
      (b.updatedAt || b.signingDate).localeCompare(a.updatedAt || a.signingDate),
    );
    const recent = contracts.slice(0, 8).map((c) => {
      const lines = c.lines?.length ?? 0;
      const total = c.lines.reduce((s, l) => s + (l.amount || 0), 0);
      return {
        id: c.id,
        title: c.contractNo,
        subtitle: `签订 ${c.signingDate} · ${lines} 行`,
        meta: `¥${total.toFixed(2)}`,
      };
    });
    this.setData({ recent });
  },

  async onShow() {
    setTabBarSelected(1);
    const ok = await ensureWechatSession();
    if (!ok) return;
    this.loadRecent();
  },
});
