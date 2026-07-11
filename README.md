# My Blog — Astro 个人博客

基于 [MultiTerm](https://github.com/stelcodes/multiterm-astro) 主题的个人博客，添加了心情热力图、GitHub 贡献图、多色主题切换等功能。

> 线上地址：https://test.wxuann.top

## 功能

- **心情热力图** — 类似 GitHub 贡献图，记录每日心情，五档配色，支持 iOS 快捷指令一键记录
- **GitHub 贡献图** — 实时展示 GitHub 贡献活动
- **多主题切换** — 59+ 编辑器配色方案任选
- **Giscus 评论** — GitHub 驱动的评论区
- **Markdown 扩展** — KaTeX 数学公式、告示框、目录、表情符号
- **SEO 优化** — RSS、Sitemap、自动社交卡片图片

## 快速开始

```bash
git clone https://github.com/wzx2007430/A-Personal-Index-with-heatmap.git
cd A-Personal-Index-with-heatmap
npm install
npm run dev
```

## 配置

所有配置在 `src/site.config.ts` 中：

- `site` / `title` / `author` — 站点基本信息
- `socialLinks` — 页脚社交链接
- `giscus` — 评论区配置（设为 `undefined` 关闭）
- `navLinks` — 导航菜单

## 心情热力图使用

### iOS 快捷指令

访问 `/mood` 页面查看配置说明。简单来说：

1. “从列表中选择” 心情
2. POST 到 `/api/mood`，带 `Authorization: Bearer <SECRET>`
3. Body: `{"mood":1-5,"date":"2026-07-11"}`

### 手动记录

```bash
curl -X POST https://test.wxuann.top/api/mood \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{"mood":4,"date":"2026-07-11"}'
```

### 查看数据

直接访问 `/api/mood` 或 `/mood` 页面。

## 部署

详见 `DEPLOY.md`。简要步骤：

```bash
npm install && npm run build
pm2 start ecosystem.config.cjs
```

Nginx 反向代理 `127.0.0.1:4321`。

## 许可

MIT License
