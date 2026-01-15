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

### 步骤 1：在 Cloudflare 手动创建 Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → 点击 **Create Application**
3. 选择 **Create Worker**
4. Worker 名称设置为 `vrchat-bot-worker`（或其他名称）
5. 点击 **Deploy**
6. 进入编辑器，**删除默认代码**
7. 将 `worker.js` 的完整内容**复制粘贴**到编辑器
8. 点击右上角 **Save and Deploy**

> **💡 提示**：手动部署的 Worker 可以通过 API 自动更新环境变量，无需重新部署。

### 步骤 2：配置 Bot 自动更新

在你的 **Replit Secrets** 中添加以下 3 个环境变量：

```bash
CLOUDFLARE_API_TOKEN=你的Cloudflare_API_Token
CLOUDFLARE_ACCOUNT_ID=你的Cloudflare_Account_ID
CLOUDFLARE_WORKER_NAME=vrchat-bot-worker
```

**如何获取：**

1. **API Token**: 
   - 访问 https://dash.cloudflare.com/profile/api-tokens
   - 点击 **Create Token** → 使用 **"Edit Cloudflare Workers"** 模板
   - 复制生成的 Token（只显示一次，请妥善保存）

2. **Account ID**: 
   - Cloudflare Dashboard 右侧边栏可以看到
   - 或在 Worker 页面 URL 中查看

3. **Worker Name**: 
   - 步骤1中创建的 Worker 名称（如 `vrchat-bot-worker`）

> **💡 完全自动化**：
> - ✅ Bot 启动时会自动调用 API 更新 Worker 的 `REPLIT_URL` 环境变量
> - ✅ 无需在 Cloudflare Dashboard 手动设置任何东西
> - ✅ 每次 Replit 重启，Bot 会自动推送新 URL

### 步骤 3：启动 Bot 测试

1. 在 Replit 启动 Bot
2. 查看日志，应该看到：
   ```
   [INFO] 🌐 Updating Cloudflare Worker environment variable...
   [INFO]    Current Replit URL: https://xxxxx.proxy.replit.dev
   [INFO] ✅ Cloudflare Worker updated successfully!
   [INFO]    🌐 Worker URL: https://vrchat-bot-worker.yueby-sp.workers.dev
   [INFO]    📊 API Endpoint: https://vrchat-bot-worker.yueby-sp.workers.dev/api/vrchat/sponsors/YOUR_GUILD_ID
   [INFO]    ❤️ Health Check: https://vrchat-bot-worker.yueby-sp.workers.dev/health
   ```
3. 访问 Health Check URL 测试：
   ```
   https://vrchat-bot-worker.yueby-sp.workers.dev/health
   ```
4. 应该返回 Bot 的健康状态 JSON

### 完成！🎉

✅ **代码自动部署**：推送代码到 GitHub，Cloudflare 自动重新部署  
✅ **URL 完全自动**：Bot 启动时自动通过 API 更新，无需任何手动操作  
✅ **双重保障**：API 更新失败时，Worker 自动从 `/__replit_url` 端点查询  
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

## 🔧 工作原理

### API 自动更新机制（完全自动 🎉）

Bot 启动时会自动调用 Cloudflare API 更新 Worker 环境变量：

```
1. Replit Bot 启动
     ↓
2. Bot 检测当前 Replit URL
     ↓
3. Bot 调用 Cloudflare API 更新 Worker 的 REPLIT_URL 环境变量
     ↓
4. Cloudflare 更新 Worker 配置（秒级生效）
     ↓
5. Worker 使用最新 URL 转发所有请求 ✅
```

**特性：**
- ✅ **完全自动**：Bot 每次启动都会自动更新 Worker
- ✅ **即时生效**：API 更新后立即生效
- ✅ **零手动操作**：无需在 Dashboard 设置任何东西
- ✅ **持久化存储**：环境变量永久保存，Worker 重启不丢失

### Bot 配置要求

在 Replit Secrets 中**必须**配置以下 3 个变量：

- `CLOUDFLARE_API_TOKEN` - 用于调用 Cloudflare API 更新环境变量（需要 Edit Workers 权限）
- `CLOUDFLARE_ACCOUNT_ID` - 你的 Cloudflare 账户 ID
- `CLOUDFLARE_WORKER_NAME` - Worker 名称（如 `vrchat-bot-worker`）

> **💡 API Token 权限**：必须使用 "Edit Cloudflare Workers" 模板创建 Token，才能更新环境变量。

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

### Q: 需要在 Cloudflare 手动设置 REPLIT_URL 吗？

A: **不需要！**Bot 会完全自动管理这个环境变量。只需在 Replit Secrets 配置好 API Token 等信息，Bot 启动时会自动调用 Cloudflare API 设置 Worker 的 `REPLIT_URL`。

### Q: REPLIT_URL 会自动更新吗？

A: 是的！Bot 每次启动时会自动调用 Cloudflare API 更新 Worker 的环境变量。如果 API 更新失败，Worker 还有备用机制从 `/__replit_url` 端点查询，确保始终能获取到最新 URL。

### Q: Replit URL 变化后多久会生效？

A: Bot 启动时立即更新（通过 Cloudflare API 秒级生效）。即使 API 更新失败，Worker 也会在 1 分钟缓存过期后从备用端点获取新 URL。

### Q: Worker 返回 503 错误怎么办？

A: 503 错误表示 Worker 无法获取 Replit URL。检查以下几点：
1. **首次使用**：第一次部署后，必须启动一次 Bot 让它更新 Worker 的环境变量
2. **检查 Bot 日志**：确认看到 "✅ Cloudflare Worker updated successfully!"
3. **验证 API 配置**：确认 Replit Secrets 中的 4 个 Cloudflare 配置正确
4. **确认 Bot 运行**：Bot 必须正在运行且可访问

### Q: 可以绑定自定义域名吗？

A: 可以！在 Worker Settings → Triggers → Custom Domains 添加你的域名。

### Q: 免费版有什么限制？

A: Cloudflare Workers 免费版限制：
- 每天 10 万次请求
- 每次请求最多 10ms CPU 时间
- 对于小型 Bot 完全够用

### Q: 如何查看我的 Worker URL？

A: Bot 启动时会自动获取 subdomain 并在日志中显示完整的 Worker URL。或者在 Cloudflare Dashboard → Worker → Triggers 中查看。

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
