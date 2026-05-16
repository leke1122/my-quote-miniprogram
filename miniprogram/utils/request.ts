import { API_BASE_URL } from "./config";
import { getStoredToken } from "./auth";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  url: string;
  method?: HttpMethod;
  data?: Record<string, unknown> | string;
  /** 默认 true：自动附带 Bearer token */
  needAuth?: boolean;
}

export function apiRequest<T = unknown>(options: RequestOptions): Promise<T> {
  const needAuth = options.needAuth !== false;
  const header: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (needAuth) {
    const token = getStoredToken();
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url.startsWith("http") ? options.url : `${API_BASE_URL}${options.url}`,
      method: options.method ?? "GET",
      data: options.data,
      header,
      success(res) {
        if (res.statusCode === 401) {
          reject(new Error("未登录或登录已过期"));
          return;
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else {
          const body = res.data as { error?: string } | undefined;
          reject(new Error(body?.error ?? `HTTP ${res.statusCode}`));
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
}
