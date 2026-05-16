import { API_BASE_URL } from "./utils/config";
import { getStoredOpenId, getStoredToken } from "./utils/auth";
import { ensureWechatSession } from "./utils/wechatAuth";

App<IAppOption>({
  globalData: {
    apiBaseUrl: API_BASE_URL,
    userToken: "",
    wechatOpenId: "",
  },
  onLaunch() {
    this.globalData.userToken = getStoredToken();
    this.globalData.wechatOpenId = getStoredOpenId();
    void ensureWechatSession();
  },
});
