import { apiRequest } from "./request";
import { getStoredToken, saveSession, clearSession } from "./auth";

interface WechatSessionResponse {
  ok?: boolean;
  error?: string;
  token?: string;
  openid?: string;
  subscription?: {
    plan?: string;
    status?: string;
    validUntil?: string | null;
  };
}

let sessionPromise: Promise<boolean> | null = null;

/** wx.login + 后端换 openid 建号，保存 token（无邮箱密码） */
export function ensureWechatSession(): Promise<boolean> {
  if (getStoredToken()) {
    const app = getApp<IAppOption>();
    if (!app.globalData.userToken) {
      app.globalData.userToken = getStoredToken();
    }
    return Promise.resolve(true);
  }

  if (sessionPromise) return sessionPromise;

  sessionPromise = new Promise((resolve) => {
    wx.login({
      success: async (loginRes) => {
        if (!loginRes.code) {
          wx.showToast({ title: "微信登录失败", icon: "none" });
          sessionPromise = null;
          resolve(false);
          return;
        }
        try {
          const data = await apiRequest<WechatSessionResponse>({
            url: "/api/auth/wechat-mini/session",
            method: "POST",
            needAuth: false,
            data: { code: loginRes.code },
          });
          if (!data.ok || !data.token) {
            wx.showToast({ title: data.error ?? "无法识别微信账号", icon: "none" });
            sessionPromise = null;
            resolve(false);
            return;
          }
          const openid = data.openid ?? "";
          saveSession(data.token, openid);
          const app = getApp<IAppOption>();
          app.globalData.wechatOpenId = openid;
          resolve(true);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "网络异常";
          wx.showToast({ title: msg, icon: "none" });
          sessionPromise = null;
          resolve(false);
        }
      },
      fail: () => {
        wx.showToast({ title: "wx.login 失败", icon: "none" });
        sessionPromise = null;
        resolve(false);
      },
    });
  });

  return sessionPromise;
}

export function resetWechatSession(): void {
  sessionPromise = null;
  clearSession();
  const app = getApp<IAppOption>();
  app.globalData.wechatOpenId = "";
}

export function maskOpenId(openid: string): string {
  if (!openid || openid.length < 8) return openid || "—";
  return `${openid.slice(0, 4)}…${openid.slice(-4)}`;
}
