import { ensureWechatSession } from "../../utils/wechatAuth";

Page({
  data: {
    title: "新建合同",
    desc: "合同编辑页开发中，逻辑对齐 Web 端 /contract/new。",
  },
  async onShow() {
    await ensureWechatSession();
  },
});
