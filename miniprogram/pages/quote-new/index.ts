import { getQuotes } from "../../utils/quoteStore";
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
    wx.navigateTo({ url: "/pages/quote-form/index" });
  },

  onOpen(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    if (id) {
      wx.navigateTo({ url: `/pages/quote-form/index?id=${encodeURIComponent(id)}` });
    }
  },

  onAllList() {
    wx.navigateTo({ url: "/pages/quote-list/index" });
  },

  loadRecent() {
    const quotes = [...getQuotes()].sort((a, b) =>
      (b.updatedAt || b.date).localeCompare(a.updatedAt || a.date),
    );
    const recent = quotes.slice(0, 8).map((q) => {
      const lines = q.lines?.length ?? 0;
      const total = q.lines.reduce((s, l) => s + (l.amount || 0), 0);
      return {
        id: q.id,
        title: q.quoteNo,
        subtitle: `${q.date} · ${lines} 行`,
        meta: `¥${total.toFixed(2)}`,
      };
    });
    this.setData({ recent });
  },

  async onShow() {
    setTabBarSelected(0);
    const ok = await ensureWechatSession();
    if (!ok) return;
    this.loadRecent();
  },
});
