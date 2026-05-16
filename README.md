# 智序签单 · 微信小程序

**独立仓库**：仅包含微信小程序前端工程，与 Web 项目 [my-quote](https://github.com/leke1122/my-quote) 分开维护、分开发布。

## 部署方式（重要）

| 项目 | GitHub | 线上发布 |
|------|--------|----------|
| **本仓库（小程序）** | 本仓库 | **微信公众平台**上传代码（开发者工具 → 上传 → 提交审核） |
| **my-quote（网站 + API）** | [leke1122/my-quote](https://github.com/leke1122/my-quote) | **Vercel**（页面 + `/api/*` 接口） |

小程序 **不部署到 Vercel**。Vercel 只跑 Next.js 网站和后端 API；小程序通过 `wx.request` 访问 `https://app.quote.zxaigc.online` 上的接口。

```
┌─────────────────────┐     HTTPS API      ┌──────────────────────────┐
│  my-quote-miniprogram│ ─────────────────► │  my-quote (Vercel)       │
│  微信开发者工具上传   │                    │  app.quote.zxaigc.online │
└─────────────────────┘                    └──────────────────────────┘
```

## 目录结构

```
my-quote-miniprogram/
├── project.config.json
├── miniprogram/
│   ├── app.json
│   ├── pages/
│   └── utils/config.ts    # API_BASE_URL → 线上 my-quote 域名
└── README.md
```

## 本地开发

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入本仓库根目录
3. AppID：`wxc9ab9141daa0d894`（`project.config.json`）
4. 复制 `project.private.config.json.example` → `project.private.config.json`（已在 .gitignore）
5. `miniprogram/utils/config.ts` 中 `API_BASE_URL` 指向已部署的 API 域名

```bash
npm install
npm run typecheck
```

## 账号与接口

- 打开小程序自动 `wx.login` → `POST /api/auth/wechat-mini/session`（openid 建号）
- **设置**：兑换激活码、从云端拉取 `GET /api/project-data`
- 后端需在 **my-quote 的 Vercel 环境变量** 配置 `WECHAT_MINI_APP_ID`、`WECHAT_MINI_APP_SECRET`

小程序账号与 Web 邮箱账号 **默认独立**，数据不自动合并。

## 发布小程序（非 Vercel）

1. 微信开发者工具 → **上传**
2. [微信公众平台](https://mp.weixin.qq.com/) → 版本管理 → 提交审核 → 发布
3. 确保 **request 合法域名** 已配置为 API 域名（如 `https://app.quote.zxaigc.online`）

## 新建本仓库并推送到 GitHub

```bash
cd my-quote-miniprogram
git init
git add .
git commit -m "chore: initial WeChat miniprogram"
git branch -M main
git remote add origin https://github.com/你的用户名/my-quote-miniprogram.git
git push -u origin main
```

在 GitHub 新建空仓库 `my-quote-miniprogram`，不要勾选「从 README 初始化」，避免冲突。
