import { API_BASE_URL } from "../../utils/config";
import { apiRequest } from "../../utils/request";
import { getStoredOpenId } from "../../utils/auth";
import { getCachedCounts, pullProjectDataFromCloud } from "../../utils/projectData";
import { ensureWechatSession, maskOpenId, resetWechatSession } from "../../utils/wechatAuth";

interface SubResponse {
  ok?: boolean;
  subscription?: { plan?: string; validUntil?: string | null };
}

interface RedeemResponse {
  ok?: boolean;
  error?: string;
  subscription?: { plan?: string; validUntil?: string | null };
}

Page({
  data: {
    apiBase: API_BASE_URL,
    openidMask: "",
    redeemCode: "",
    syncing: false,
    redeeming: false,
    planLabel: "",
    counts: {
      products: 0,
      customers: 0,
      companies: 0,
      quotes: 0,
      contracts: 0,
    },
  },

  onGoHome() {
    wx.reLaunch({ url: "/pages/home/index" });
  },

  async onShow() {
    const ok = await ensureWechatSession();
    if (!ok) return;
    this.setData({ openidMask: maskOpenId(getStoredOpenId()) });
    this.refreshCounts();
    void this.loadSubscription();
  },

  refreshCounts() {
    this.setData({ counts: getCachedCounts() });
  },

  async loadSubscription() {
    try {
      const res = await apiRequest<SubResponse>({ url: "/api/subscription/me", method: "GET" });
      if (res.ok && res.subscription) {
        const until = res.subscription.validUntil
          ? res.subscription.validUntil.slice(0, 10)
          : "永久/未设截止";
        this.setData({
          planLabel: `${res.subscription.plan ?? "—"} · 至 ${until}`,
        });
      } else {
        this.setData({ planLabel: "未激活（可兑换激活码）" });
      }
    } catch {
      this.setData({ planLabel: "—" });
    }
  },

  onRedeemInput(e: WechatMiniprogram.Input) {
    this.setData({ redeemCode: e.detail.value });
  },

  async onRedeem() {
    const code = this.data.redeemCode.trim();
    if (!code) {
      wx.showToast({ title: "请输入激活码", icon: "none" });
      return;
    }
    this.setData({ redeeming: true });
    try {
      const res = await apiRequest<RedeemResponse>({
        url: "/api/subscription/redeem",
        method: "POST",
        data: { code },
      });
      if (!res.ok) {
        wx.showToast({ title: res.error ?? "兑换失败", icon: "none" });
        return;
      }
      wx.showToast({ title: "兑换成功", icon: "success" });
      this.setData({ redeemCode: "" });
      void this.loadSubscription();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "网络异常";
      wx.showToast({ title: msg, icon: "none" });
    } finally {
      this.setData({ redeeming: false });
    }
  },

  async onPullData() {
    this.setData({ syncing: true });
    wx.showLoading({ title: "同步中…" });
    try {
      const res = await pullProjectDataFromCloud();
      if (!res.ok) {
        wx.showToast({ title: res.error ?? "同步失败", icon: "none" });
        return;
      }
      this.refreshCounts();
      wx.showToast({ title: "云端数据已拉取", icon: "success" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "网络异常";
      wx.showToast({ title: msg, icon: "none" });
    } finally {
      wx.hideLoading();
      this.setData({ syncing: false });
    }
  },

  onResetIdentity() {
    wx.showModal({
      title: "重新识别微信",
      content: "将清除本机缓存并重新用当前微信 openid 建号登录",
      success: (r) => {
        if (!r.confirm) return;
        resetWechatSession();
        void ensureWechatSession().then((ok) => {
          if (ok) {
            this.setData({ openidMask: maskOpenId(getStoredOpenId()) });
            void this.loadSubscription();
          }
        });
      },
    });
  },
});
