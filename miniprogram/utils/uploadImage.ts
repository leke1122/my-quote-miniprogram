import { API_BASE_URL } from "./config";
import { getStoredToken } from "./auth";

interface MiniUploadResponse {
  ok?: boolean;
  url?: string;
  error?: string;
}

/** 选择商品图并上传到 Vercel Blob，返回公网 URL */
export function chooseAndUploadProductImage(): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (pick) => {
        const file = pick.tempFiles[0];
        if (!file?.tempFilePath) {
          reject(new Error("未选择图片"));
          return;
        }
        const token = getStoredToken();
        if (!token) {
          reject(new Error("请先完成微信登录"));
          return;
        }
        wx.showLoading({ title: "上传中…", mask: true });
        wx.uploadFile({
          url: `${API_BASE_URL}/api/blob/mini-upload`,
          filePath: file.tempFilePath,
          name: "file",
          header: {
            Authorization: `Bearer ${token}`,
          },
          success: (res) => {
            wx.hideLoading();
            if (res.statusCode === 401) {
              reject(new Error("登录已过期，请重新打开小程序"));
              return;
            }
            let body: MiniUploadResponse = {};
            try {
              body = JSON.parse(res.data) as MiniUploadResponse;
            } catch {
              reject(new Error(`上传失败（HTTP ${res.statusCode}）`));
              return;
            }
            if (res.statusCode >= 200 && res.statusCode < 300 && body.ok && body.url) {
              resolve(body.url);
              return;
            }
            reject(new Error(body.error ?? `上传失败（HTTP ${res.statusCode}）`));
          },
          fail: (err) => {
            wx.hideLoading();
            reject(new Error(err.errMsg || "上传失败"));
          },
        });
      },
      fail: (err) => {
        if (err.errMsg?.includes("cancel")) {
          reject(new Error("已取消"));
          return;
        }
        reject(new Error(err.errMsg || "选择图片失败"));
      },
    });
  });
}
