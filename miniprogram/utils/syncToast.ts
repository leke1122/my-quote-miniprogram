import type { SyncResult } from "./entityStore";

export function showSyncResult(res: SyncResult, okTitle = "已保存"): void {
  if (res.ok) {
    wx.showToast({ title: okTitle, icon: "success" });
    return;
  }
  wx.showModal({
    title: "云端同步失败",
    content: `${res.error ?? "未知错误"}\n数据已保存在本机，可稍后在设置中重试拉取/保存。`,
    showCancel: false,
  });
}
