/**
 * Cloudflare Worker - VRChat Bot 反向代理
 * 
 * 支持平台（100% 确认无需绑卡，2026年1月15日验证）：
 * - Koyeb (0.1 vCPU, 512 MB) - 1小时无流量自动休眠
 * - Railway (1 vCPU, 512 MB) - $5/月约500小时
 * - Render (0.1 vCPU, 512 MB) - 15分钟无活动休眠
 * - Zeabur (1 vCPU, 2 GB) - $5/月按量计费
 * - Fly.io (1 vCPU, 256 MB) - 3个实例+160GB流量
 * 
 * 配置方法：
 * 在 Cloudflare Worker 设置中添加环境变量：
 * BACKEND_URL = https://your-app.koyeb.app
 * 
 * Bot 启动时会自动检测平台并更新 BACKEND_URL（需配置 Cloudflare API Token）
 */

export default {
  async fetch(request, env, ctx) {
    // 从环境变量获取后端 URL
    const BACKEND_URL = env.BACKEND_URL;
    
    // 检查环境变量是否配置
    if (!BACKEND_URL) {
      return new Response(JSON.stringify({
        error: 'Configuration Error',
        message: 'BACKEND_URL not configured. Please set it in Worker environment variables.',
        example: 'BACKEND_URL=https://your-app.koyeb.app',
        timestamp: new Date().toISOString()
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 构建目标 URL
    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, BACKEND_URL);
    
    // 处理 OPTIONS 预检请求（CORS）
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }
    
    // 复制请求头
    const headers = new Headers(request.headers);
    headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
    headers.set('X-Real-IP', request.headers.get('CF-Connecting-IP') || '');
    headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));
    headers.set('X-Forwarded-Host', url.hostname);
    
    try {
      // 转发请求到后端服务器
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
        redirect: 'follow'
      });
      
      // 获取响应
      const response = await fetch(modifiedRequest);
      
      // 复制响应并添加 CORS 头
      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      // 添加 CORS 头
      modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
      modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      
      // 添加自定义头，标识经过了 Cloudflare Worker
      modifiedResponse.headers.set('X-Proxied-By', 'Cloudflare-Worker');
      modifiedResponse.headers.set('X-Backend-URL', BACKEND_URL);
      
      return modifiedResponse;
      
    } catch (error) {
      // 错误处理
      return new Response(JSON.stringify({
        error: 'Proxy Error',
        message: error.message || 'Failed to connect to backend',
        timestamp: new Date().toISOString()
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
