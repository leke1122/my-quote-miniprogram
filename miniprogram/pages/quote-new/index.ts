import { ensureWechatSession } from "../../utils/wechatAuth";

Page({
  data: {
    title: "新建报价",
    desc: "报价编辑页开发中，逻辑对齐 Web 端 /quote/new。",
  },
  async onShow() {
    await ensureWechatSession();
  },
});
