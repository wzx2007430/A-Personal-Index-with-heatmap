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
    MoodSparkline.astro  # 心情迷你趋势线
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

## 编码规范 [重要]

- **文件编码必须为 UTF-8 without BOM**
- **禁止使用 `\\uXXXX` Unicode 转义**，直接写中文字符（"总计" 而非 "\\u603B\\u8BA1"）
- **禁止使用 PowerShell `Set-Content` 写入 `.astro/.ts/.js` 文件**（会产生 BOM）
- 写入源码文件使用 Python: `open(path, 'w', encoding='utf-8')` 或 Node: `fs.writeFileSync(path, content, 'utf-8')`
- 模板（JSX）中的字符串直接写中文，前端代码块（---之间）中的 `const` 字符串也直接写中文

## 常用命令
```bash
npm run dev            # 本地开发
npm run build          # 构建
npm start              # 生产启动
pm2 start ecosystem.config.cjs
pm2 restart multiterm-astro
```

## 心情热力图
- API：`POST /api/mood`，认证 `Authorization: Bearer <MOOD_SECRET>`
- 数据文件：`data/moods.json`，格式 `[{"date":"YYYY-MM-DD","mood":1-5}]`
- `MOOD_SECRET` 通过 PM2 env 注入（`process.env.MOOD_SECRET`）
- 心情值：1=很差(红), 2=不太好(黄), 3=一般(粉), 4=还行(蓝), 5=极好(绿)
- 颜色：`#ef4444` / `#fbbf24` / `#f472b6` / `#38bdf8` / `#16a34a`
- 未记录：`#ebedf0`（同 GitHub 空白格）
- 连续天数：从最新记录日期向前计算，遇 gap 停止

## 部署
- Nginx 反向代理 → `127.0.0.1:4321`
- `/api/mood` 有 nginx 层速率限制（2r/s）
- 项目路径：`/root/multiterm-astro`
- 修改源码后需 `npm run build && pm2 restart`

## 注意事项
- 本地 Windows 编辑文件上传 Linux 前必须确认无 BOM
- `process.cwd()` 依赖 PM2 的 `cwd` 配置
- GitHubActivityCalendar 有 fetch 失败兜底，网络异常不会 500