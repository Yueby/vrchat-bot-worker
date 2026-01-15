# Cloudflare Worker - VRChat Bot 反向代理

## 🌐 功能

- **反向代理**：为 Bot 提供固定的访问域名
- **国内加速**：利用 Cloudflare CDN 加速中国大陆访问
- **自动更新**：Bot 启动时自动同步后端 URL 到 Worker
- **CORS 支持**：自动添加跨域请求头

---

## 🚀 部署步骤

### 1. 部署 Worker 到 Cloudflare

#### 方法 A：使用 Wrangler CLI（推荐）

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署 Worker
cd vrchat-bot-worker
wrangler deploy worker.js
```

#### 方法 B：使用 Cloudflare Dashboard

1. 访问 [Cloudflare Workers](https://dash.cloudflare.com/)
2. 点击 **Create a Service**
3. 命名服务（如 `vrchat-bot`）
4. 选择 **HTTP Handler**
5. 点击 **Quick Edit**
6. 复制 `worker.js` 的内容并粘贴
7. 点击 **Save and Deploy**

---

### 2. 配置环境变量

#### 在 Cloudflare Worker 设置中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `BACKEND_URL` | `https://your-app.koyeb.app` | 你的 Bot 后端地址 |

**设置步骤：**
1. 打开你的 Worker
2. 点击 **Settings** → **Variables**
3. 添加环境变量 `BACKEND_URL`
4. 类型选择 **Secret**（加密存储）
5. 点击 **Save**

---

### 3. 配置 Bot 自动更新（推荐）

Bot 会**自动检测平台 URL** 并同步到 Worker！

**支持的平台：** Koyeb, Railway, Render, Zeabur, Fly.io

**需要在 Bot 环境变量中添加：**

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | 见下方说明 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | Dashboard 右侧显示 |
| `CLOUDFLARE_WORKER_NAME` | Worker 名称 | 如 `vrchat-bot` |

**可选：** 如果自动检测失败，手动指定：
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `BACKEND_URL` | `https://your-app.koyeb.app` | 手动指定后端地址 |

#### 获取 Cloudflare API Token

1. 访问 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token**
3. 选择 **Edit Cloudflare Workers** 模板
4. 或自定义权限：
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **Workers KV Storage** → **Edit**（如果使用 KV）
5. 复制生成的 Token

---

## 📝 使用方式

### Worker URL

部署后，你的 Worker 地址类似：

```
https://vrchat-bot.your-subdomain.workers.dev
```

### API 端点

```
GET https://vrchat-bot.your-subdomain.workers.dev/api/vrchat/sponsors/{guildId}
GET https://vrchat-bot.your-subdomain.workers.dev/health
```

---

## 🔧 自定义域名（可选）

### 1. 在 Cloudflare 添加自定义域名

1. 进入 Worker 设置
2. 点击 **Triggers** → **Custom Domains**
3. 点击 **Add Custom Domain**
4. 输入域名（如 `api.yourdomain.com`）
5. Cloudflare 会自动配置 DNS

### 2. 使用自定义域名访问

```
https://api.yourdomain.com/api/vrchat/sponsors/{guildId}
```

---

## 🇨🇳 国内访问加速

### Cloudflare 在中国的优势

- ✅ Cloudflare 在中国有合作节点
- ✅ 自动选择最近的边缘节点
- ✅ 智能路由优化
- ✅ 免费的 CDN 加速

### 进一步优化

如果需要更好的国内访问速度，可以：

1. **使用中国大陆友好的域名**
   - 在 Cloudflare 配置自定义域名
   - 使用大陆可访问的顶级域名

2. **开启 Cloudflare Argo**（付费）
   - 智能路由，速度更快
   - 每月 $5 + $0.10/GB

3. **配置缓存策略**
   - 在 Worker 中添加缓存逻辑
   - 减少回源请求

---

## 🔍 故障排查

### Worker 返回 503 错误

**错误消息：**
```json
{
  "error": "Configuration Error",
  "message": "BACKEND_URL not configured"
}
```

**解决方案：**
- 检查 Worker 环境变量是否正确设置 `BACKEND_URL`

### Worker 返回 502 错误

**错误消息：**
```json
{
  "error": "Proxy Error",
  "message": "Failed to connect to backend"
}
```

**解决方案：**
- 检查 `BACKEND_URL` 是否正确
- 确认 Bot 服务是否正常运行
- 访问 `{BACKEND_URL}/health` 测试后端是否可访问

### Bot 启动时未更新 Worker

**检查：**
1. 是否配置了 `CLOUDFLARE_API_TOKEN` 等环境变量
2. API Token 权限是否正确
3. Worker 名称是否匹配

**查看日志：**
Bot 启动时会显示 Cloudflare 更新状态：
```
✅ Cloudflare Worker updated successfully!
   🌐 Worker URL: https://vrchat-bot.xxx.workers.dev
   🚀 Backend: https://your-app.koyeb.app
```

---

## 📊 监控和分析

### 查看 Worker 请求统计

1. 打开 Cloudflare Dashboard
2. 进入你的 Worker
3. 查看 **Analytics** 标签

### 查看实时日志

```bash
wrangler tail
```

---

## 🛡️ 安全建议

1. **使用 Secret 存储敏感信息**
   - `BACKEND_URL` 设置为 Secret 类型
   - 防止在日志中泄露

2. **限制访问来源**（可选）
   - 在 Worker 中添加 IP 白名单
   - 或使用 Cloudflare Access

3. **启用 Rate Limiting**
   - Bot 已内置限流（180次/分钟）
   - Worker 可添加额外的边缘限流

---

## 💡 示例配置

### 自动检测（推荐 ⭐）

Bot 会自动检测平台，无需手动配置 `BACKEND_URL`：

```env
# Bot 环境变量（只需这3个即可自动同步）
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_WORKER_NAME=vrchat-bot

# 其他必需的环境变量
DISCORD_TOKEN=your_discord_token
CLIENT_ID=your_client_id
MONGO_URI=mongodb+srv://...
```

**支持自动检测的平台（100% 确认无需绑卡 💳）：**

| 平台 | CPU | 内存 | 环境变量 | 域名格式 | 特点 |
|------|-----|------|---------|---------|------|
| **Koyeb** | 0.1 vCPU | 512 MB | `KOYEB_PUBLIC_DOMAIN` | 自动提供 | 1小时无流量休眠 |
| **Railway** | 1 vCPU | 512 MB | `RAILWAY_PUBLIC_DOMAIN` / `RAILWAY_STATIC_URL` | 完整 URL | $5/月（约500小时）|
| **Render** | 0.1 vCPU | 512 MB | `RENDER_EXTERNAL_URL` / `RENDER_EXTERNAL_HOSTNAME` | 完整 URL 或主机名 | 15分钟无活动休眠 |
| **Zeabur** | 1 vCPU | 2 GB | `ZEABUR_WEB_URL` / `ZEABUR_WEB_DOMAIN` | Git 部署服务 | $5/月（按量计费）|
| **Fly.io** | 1 vCPU | 256 MB | `FLY_APP_NAME` | `${APP_NAME}.fly.dev` | 3个实例+160GB流量 |

> 💡 **数据来源**：基于 2026 年 1 月 15 日的官方文档验证，100% 确认无需绑卡

### 手动指定（备用方案）

如果自动检测失败，手动添加：

```env
BACKEND_URL=https://your-app.koyeb.app  # 手动指定
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_WORKER_NAME=vrchat-bot
```

---

## 🎯 总结

使用 Cloudflare Worker 作为反向代理的优势：

✅ **固定域名**：无论后端如何变化，对外 URL 保持不变  
✅ **全球加速**：Cloudflare 边缘网络，低延迟  
✅ **国内友好**：相比直连国外服务器，速度更快  
✅ **免费额度**：每天 100,000 次请求免费  
✅ **自动更新**：Bot 启动时自动同步后端地址  
✅ **高可用性**：Cloudflare 99.99% SLA  

---

## 📚 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Workers 定价](https://developers.cloudflare.com/workers/platform/pricing/)
