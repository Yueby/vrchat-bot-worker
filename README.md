# Cloudflare Worker - VRChat Bot 反向代理

为 Replit 等临时 URL 提供**固定域名访问**。

## 🎯 功能特性

- ✅ **固定域名**：稳定的 `workers.dev` 地址
- ✅ **自动更新**：Bot 启动时自动更新后端 URL
- ✅ **即时生效**：API 更新后秒级生效
- ✅ **全球 CDN**：Cloudflare 全球加速
- ✅ **完全免费**：每天 10 万次请求

---

## 🚀 部署步骤

### 步骤 1：创建 Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Create Application** → **Create Worker**
3. 命名 Worker（例如 `vrchat-bot-worker`）
4. 点击 **Deploy**
5. 点击 **Edit code** 进入编辑器
6. **删除所有默认代码**
7. **复制粘贴** `worker.js` 的完整内容
8. 点击 **Save and Deploy**

### 步骤 2：配置 Bot 自动更新

在 **Replit Secrets** 中添加以下环境变量：

```bash
CLOUDFLARE_API_TOKEN=你的API_Token
CLOUDFLARE_ACCOUNT_ID=你的账户ID
CLOUDFLARE_WORKER_NAME=vrchat-bot-worker
```

**如何获取：**

1. **API Token**：
   - 访问 https://dash.cloudflare.com/profile/api-tokens
   - **Create Token** → 使用 **"Edit Cloudflare Workers"** 模板
   - 复制生成的 Token（只显示一次）

2. **Account ID**：
   - Cloudflare Dashboard 右侧边栏
   - 或 Worker 页面 URL 中查看

3. **Worker Name**：
   - 步骤 1 中创建的 Worker 名称

### 步骤 3：启动 Bot

1. 启动 Bot
2. 查看日志，确认看到：
   ```
   [INFO] Updating Cloudflare Worker: https://...
   [INFO] Cloudflare Worker updated successfully!
   [INFO]    Worker URL: https://vrchat-bot-worker.yueby-sp.workers.dev
   ```
3. 访问 Worker URL 测试：
   ```
   https://your-worker.your-subdomain.workers.dev/health
   ```

---

## 📖 工作原理

```
VRChat 世界 / 网页应用
        ↓
Cloudflare Worker (固定域名)
        ↓
[读取 REPLIT_URL 环境变量]
        ↓
Replit Bot (临时 URL)
        ↓
Discord API + MongoDB
```

### 自动更新机制

1. Bot 在 Replit 启动时检测当前 URL
2. 调用 Cloudflare Secrets API 更新 Worker 的 `REPLIT_URL`
3. Worker 立即使用最新 URL 转发请求

**特性：**
- ✅ **完全自动**：Bot 每次启动都会自动更新
- ✅ **即时生效**：API 更新后秒级生效
- ✅ **持久化**：环境变量永久保存

---

## 🌐 使用

### 健康检查

```bash
https://your-worker.your-subdomain.workers.dev/health
```

### API 端点

```bash
https://your-worker.your-subdomain.workers.dev/api/vrchat/sponsors/{guildId}
```

### 在 VRChat 中使用

```csharp
// Udon# 示例
string apiUrl = "https://your-worker.your-subdomain.workers.dev/api/vrchat/sponsors/" + guildId;
UnityWebRequest request = UnityWebRequest.Get(apiUrl);
yield return request.SendWebRequest();

if (request.result == UnityWebRequest.Result.Success) {
    string jsonResponse = request.downloadHandler.text;
    // 处理数据
}
```

---

## ❓ 常见问题

### Q: 需要手动设置 REPLIT_URL 吗？

A: **不需要**。Bot 会完全自动管理这个环境变量。

### Q: REPLIT_URL 会自动更新吗？

A: 是的！Bot 每次启动时会自动调用 Cloudflare API 更新。

### Q: Worker 返回 503 错误？

A: 首次部署后，必须启动一次 Bot 让它更新 Worker 的环境变量。检查：
1. Bot 日志中是否有 "Cloudflare Worker updated successfully!"
2. Replit Secrets 中的 3 个 Cloudflare 配置是否正确
3. Bot 是否正在运行

### Q: 可以绑定自定义域名吗？

A: 可以！在 Worker Settings → Triggers → Custom Domains 添加。

### Q: 免费版有什么限制？

A: Cloudflare Workers 免费版限制：
- 每天 10 万次请求
- 每次请求最多 10ms CPU 时间
- 对于小型 Bot 完全够用

---

## 📄 许可证

MIT License
