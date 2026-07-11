# AGENTS.md — MultiTerm Astro Blog

## 项目概述
Astro 5 博客项目，支持 SSR，部署于 Nginx + PM2 + Node.js。

## 目录结构

```
src/
  pages/
    api/mood.ts          # 心情 API（POST 记录，GET 查询）
    index.astro          # 首页（SSR，含心情热力图）
    mood.astro           # 心情热力图独立页
    posts/               # 博客文章
  components/
    MoodHeatmap.astro    # SVG 心情热力图（GitHub 贡献图风格）
    GitHubActivityCalendar.astro  # GitHub 贡献热力图（含错误兜底）
    HomeBanner.astro     # 首页横幅（头像 + 两热力图）
    SocialLinks.astro    # 页脚社交链接
    Footer.astro         # 页脚版权
  utils/
    mood.ts              # 共享工具：readMoods, writeMoods, validateAuthToken, calculateStreak, formatDate
  layouts/
    Layout.astro         # 全局布局
  site.config.ts         # 站点配置（标题、作者、社交链接、主题等）
  icons/                 # SVG 图标
data/
  moods.json             # 心情数据存储（运行时读写）
```

## 常用命令

```bash
npm run dev            # 本地开发
npm run build          # 构建
npm start              # 生产启动（node dist/server/entry.mjs）
pm2 start ecosystem.config.cjs  # PM2 启动
pm2 restart multiterm-astro     # 重启
```

## 心情热力图

- API：`POST /api/mood`，认证 `Authorization: Bearer <MOOD_SECRET>`
- 数据文件：`data/moods.json`，格式 `[{"date":"YYYY-MM-DD","mood":1-5}]`
- `MOOD_SECRET` 通过 PM2 env 注入（`process.env.MOOD_SECRET`）
- 心情值：1=很差, 2=不太好, 3=一般, 4=还行, 5=极好
- 连续天数：从最新记录日期向前计算，遇 gap 停止

## 部署

- Nginx 反向代理 → `127.0.0.1:4321`
- `/api/mood` 有 nginx 层速率限制（2r/s）
- 项目路径：`/root/multiterm-astro`
- 所有 `.astro` 文件模板使用 2 空格缩进
- 修改 `site.config.ts` 或任何源码后需 `npm run build && pm2 restart`

## 注意事项

- 本地 Windows 编辑的文件上传到 Linux 前需清除 UTF-8 BOM
- `process.cwd()` 依赖 PM2 的 `cwd` 配置，数据文件读写基于此路径
- GitHubActivityCalendar 有 fetch 失败兜底，不会因网络问题导致页面 500