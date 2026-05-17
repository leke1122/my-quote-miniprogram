import { setTabBarSelected } from "../../utils/tabBar";
import { ensureWechatSession } from "../../utils/wechatAuth";

Page({
  data: {
    title: "新建报价",
    desc: "报价编辑页开发中，逻辑对齐 Web 端 /quote/new。",
  },
  onGoHome() {
    wx.reLaunch({ url: "/pages/home/index" });
  },

  async onShow() {
    setTabBarSelected(0);
    await ensureWechatSession();
  },
});
