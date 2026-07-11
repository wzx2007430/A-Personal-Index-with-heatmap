# MultiTerm Astro 博客 — Nginx 部署手册

> 域名：`multiterm.stelclementine.com`  
> Node 端口：`4321`  
> 进程管理：PM2

---

## 一、服务器环境

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

---

## 二、上传 & 部署

```bash
# 上传项目到 /srv/multiterm-astro
cd /srv/multiterm-astro

# 配置密钥
cp .env.example .env
# 生成随机密钥：openssl rand -hex 32
# 编辑 .env 替换 MOOD_SECRET

# 安装 & 构建
npm install
npm run build
```

---

## 三、PM2 进程守护

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # 按提示执行输出的命令
```

常用：
```bash
pm2 status          # 状态
pm2 logs multiterm  # 日志
pm2 restart multiterm
```

---

## 四、Nginx 配置

新增 `/etc/nginx/sites-available/multiterm`：

```nginx
server {
    listen 80;
    server_name multiterm.stelclementine.com;

    client_max_body_size 1m;

    # ========== 心情 API ==========
    location /api/mood {
        # 每 IP 每秒最多 2 次，突发 3 次
        limit_req zone=mood_api burst=3 nodelay;
        limit_req_status 429;

        proxy_pass http://127.0.0.1:4321;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ========== 其他请求 ==========
    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

在 `/etc/nginx/nginx.conf` 的 `http {}` 块中添加速率限制区域：

```nginx
http {
    # ... 已有配置 ...
    limit_req_zone $binary_remote_addr zone=mood_api:10m rate=2r/s;
}
```

启用：
```bash
ln -s /etc/nginx/sites-available/multiterm /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 五、防火墙

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable
```

---

## 六、验证

```bash
# 检查 Node 服务
curl http://127.0.0.1:4321/

# GET 心情数据
curl http://127.0.0.1:4321/api/mood

# POST 记录心情（替换 SECRET 和域名）
curl -X POST http://你的域名/api/mood \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{"mood":4,"date":"2026-07-11"}'

# 测试速率限制
for i in $(seq 1 10); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://你的域名/api/mood \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_SECRET" \
    -d '{"mood":3,"date":"2026-07-11"}'
done
```

---

## 七、更新部署

```bash
cd /srv/multiterm-astro
git pull && npm install && npm run build
pm2 restart multiterm-astro
```
