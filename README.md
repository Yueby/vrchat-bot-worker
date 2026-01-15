# VRChat Bot Cloudflare Worker

为 VRChat Sponsor Bot 提供**永久固定域名**的智能反向代理。

## 🎯 功能特性

- ✅ **固定域名**：获得稳定的 `workers.dev` 访问地址
- ✅ **智能追踪**：自动从 Bot 获取最新的 Replit URL
- ✅ **双重保障**：环境变量 + 动态查询两种机制
- ✅ **全球加速**：利用 Cloudflare 全球 CDN 网络
- ✅ **CORS 支持**：完整的跨域请求支持
- ✅ **完全免费**：Cloudflare Workers 免费版每天 10 万次请求

## 🚀 部署步骤

### 步骤 1：在 Cloudflare 连接 GitHub 仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → 点击右上角 **Create Application**
3. 在 "Ship something new" 页面，点击 **Continue with GitHub**
4. 授权 Cloudflare 访问你的 GitHub（如果是第一次）
5. 选择**本项目的 GitHub 仓库**（如 `vrchat-sponser-bot`）
6. 在 "Set up builds and deployments" 页面配置：
   - **Project name**: 自定义名称（如 `vrchat-bot-proxy`）
   - **Production branch**: `main`
   - **Framework preset**: None
   - **Root directory (path)**: `cloudflare-worker` ⚠️ **重要！**
   - **Build command**: 留空
   - **Build output directory**: 留空
7. 点击 **Save and Deploy**

> **💡 提示**：设置 **Root directory** 为 `cloudflare-worker` 非常重要，这样 Cloudflare 才能找到 `wrangler.toml` 配置文件并正确部署 Worker。

### 步骤 2：配置 Bot 自动更新（推荐）

在你的 **Replit Secrets** 中添加以下环境变量，Bot 启动时会自动更新 Worker 的 `REPLIT_URL`：

```bash
CLOUDFLARE_API_TOKEN=你的Cloudflare_API_Token
CLOUDFLARE_ACCOUNT_ID=你的Cloudflare_Account_ID
CLOUDFLARE_WORKER_NAME=worker名称（与步骤1中部署的名称一致）
CLOUDFLARE_WORKER_SUBDOMAIN=你的workers.dev子域名（如 yueby-sp）
```

**如何获取这些信息：**
- **API Token**: [创建 API Token](https://dash.cloudflare.com/profile/api-tokens) → 使用 "Edit Cloudflare Workers" 模板
- **Account ID**: Cloudflare Dashboard 右侧边栏可以看到
- **Worker Name**: 步骤1中部署后的 Worker 名称
- **Subdomain**: Worker URL 中的子域名部分（`https://{name}.{subdomain}.workers.dev`）

### 步骤 3：启动 Bot 并验证

1. 在 Replit 启动 Bot
2. 查看日志，应该看到：
   ```
   [INFO] 🌐 Updating Cloudflare Worker environment variable...
   [INFO]    Current Replit URL: https://xxxxx.proxy.replit.dev
   [INFO] ✅ Cloudflare Worker updated successfully!
   [INFO]    Worker URL: https://worker-name.subdomain.workers.dev
   ```
3. 访问 Worker URL 测试：
   ```
   https://your-worker.your-subdomain.workers.dev/health
   ```

### 完成！

✅ **代码自动部署**：推送代码到 GitHub，Cloudflare 自动重新部署  
✅ **URL 自动更新**：Bot 启动时自动调用 Cloudflare API 更新 Worker 环境变量  
✅ **双重保障**：如果 API 更新失败，Worker 还能从 `/__replit_url` 端点查询  
✅ **零维护成本**：配置一次，永久自动运行

## 📖 工作原理

```
VRChat 世界 / 网页应用
        ↓
Cloudflare Worker (固定域名 *.workers.dev)
        ↓
[读取 REPLIT_URL 环境变量]
        ↓
Replit Bot (临时 URL，每次启动自动更新 Worker)
        ↓
Discord API + MongoDB
```

### 自动更新机制

**主动更新（推荐）：**
1. Bot 在 Replit 启动时检测当前 URL
2. 调用 Cloudflare API 更新 Worker 的 `REPLIT_URL` 环境变量
3. Worker 立即使用最新 URL 转发请求（秒级生效）

**备用机制（双重保障）：**
1. 如果 API 更新失败，Worker 从 `/__replit_url` 端点查询
2. 查询结果缓存 1 分钟，减少请求次数
3. 确保即使 API 失败也能获取最新 URL

## 🌐 使用 Worker

### 健康检查

```bash
https://your-worker.your-subdomain.workers.dev/health
```

返回：
```json
{
  "status": "ok",
  "uptime": 123,
  "timestamp": 1234567890,
  "services": {
    "database": "connected",
    "discord": "online",
    "guilds": 1
  }
}
```

### API 端点

```bash
https://your-worker.your-subdomain.workers.dev/api/vrchat/sponsors/{guildId}
```

### 在 VRChat 中使用

```csharp
// Udon# 示例
string apiUrl = "https://your-worker.your-subdomain.workers.dev/api/vrchat/sponsors/" + guildId;

// 使用 UnityWebRequest 发送请求
UnityWebRequest request = UnityWebRequest.Get(apiUrl);
yield return request.SendWebRequest();

if (request.result == UnityWebRequest.Result.Success) {
    string jsonResponse = request.downloadHandler.text;
    // 处理响应数据
}
```

## 🔧 配置说明

### 环境变量

- **REPLIT_URL** (必需)
  - 类型：Text
  - 说明：Bot 的当前 Replit URL
  - 示例：`https://xxxxx.proxy.replit.dev`
  - 设置位置：Cloudflare Dashboard → Worker → Settings → Variables

### Bot 配置说明

Bot 会在启动时自动调用 Cloudflare API 更新 Worker 的 `REPLIT_URL` 环境变量，确保 Worker 始终指向最新的 Replit URL。

**工作流程：**
1. Bot 在 Replit 启动
2. 检测当前 Replit URL（从 `REPLIT_DEV_DOMAIN` 环境变量）
3. 调用 Cloudflare API 更新 Worker 的 `REPLIT_URL` 环境变量
4. Worker 立即使用最新的 URL 转发请求

如果 API 更新失败（如配置缺失），Worker 会回退到从 `/__replit_url` 端点动态查询的备用机制。

## 📊 监控与调试

### 查看 Worker 日志

Cloudflare Dashboard → Worker → Logs

### 响应头信息

Worker 会在响应中添加以下自定义头：

- `X-Proxied-By: Cloudflare-Worker` - 标识请求经过了 Worker
- `X-Backend-URL: https://...` - 显示当前转发的后端 URL

### 测试 URL 追踪

```bash
# 1. 访问 Worker URL
curl -I https://your-worker.your-subdomain.workers.dev/health

# 2. 查看 X-Backend-URL 响应头
# 应该显示当前的 Replit URL
```

## ❓ 常见问题

### Q: REPLIT_URL 会自动更新吗？

A: 是的！Bot 每次启动时会自动调用 Cloudflare API 更新 Worker 的环境变量。如果 API 更新失败，Worker 还有备用机制从 `/__replit_url` 端点查询，确保始终能获取到最新 URL。

### Q: Replit URL 变化后多久会生效？

A: Bot 启动时立即更新（通过 Cloudflare API 秒级生效）。即使 API 更新失败，Worker 也会在 1 分钟缓存过期后从备用端点获取新 URL。

### Q: Worker 返回 503 错误怎么办？

A: 检查以下几点：
1. **确认 Bot 已启动**：Bot 启动时会自动更新 Worker
2. **检查 Bot 日志**：查看是否显示 "✅ Cloudflare Worker updated successfully!"
3. **验证 API 配置**：确认 Replit Secrets 中的 Cloudflare API 配置正确
4. **检查 Bot URL**：确认 Replit Bot 正在运行且可访问

### Q: 可以绑定自定义域名吗？

A: 可以！在 Worker Settings → Triggers → Custom Domains 添加你的域名。

### Q: 免费版有什么限制？

A: Cloudflare Workers 免费版限制：
- 每天 10 万次请求
- 每次请求最多 10ms CPU 时间
- 对于小型 Bot 完全够用

### Q: 如何查看我的 workers.dev 子域名？

A: 在 Cloudflare Dashboard → Worker → Triggers 中查看，URL 格式为：`{worker-name}.{subdomain}.workers.dev`

## 📝 文件说明

- `worker.js` - Worker 核心代码（智能代理逻辑）
- `wrangler.toml` - Cloudflare 部署配置
- `README.md` - 本文档（部署和使用指南）
- `.gitignore` - Git 忽略文件

## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [主 Bot 仓库](../README.md)
- [Cloudflare Dashboard](https://dash.cloudflare.com)

## 📄 许可证

MIT License - 与主项目保持一致
