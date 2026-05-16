const TOKEN_KEY = "auth_token";
const OPENID_KEY = "auth_openid";

export function getStoredToken(): string {
  try {
    const t = wx.getStorageSync(TOKEN_KEY);
    return typeof t === "string" ? t : "";
  } catch {
    return "";
  }
}

export function getStoredOpenId(): string {
  try {
    const o = wx.getStorageSync(OPENID_KEY);
    return typeof o === "string" ? o : "";
  } catch {
    return "";
  }
}

export function saveSession(token: string, openid: string): void {
  wx.setStorageSync(TOKEN_KEY, token);
  wx.setStorageSync(OPENID_KEY, openid);
  const app = getApp<IAppOption>();
  app.globalData.userToken = token;
  app.globalData.wechatOpenId = openid;
}

export function clearSession(): void {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(OPENID_KEY);
  const app = getApp<IAppOption>();
  app.globalData.userToken = "";
  app.globalData.wechatOpenId = "";
}

export function isLoggedIn(): boolean {
  return Boolean(getStoredToken());
}
