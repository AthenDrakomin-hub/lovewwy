# 部署配置文档

## 项目概述
本项目是一个新闻聚合与音乐播放系统的仪表盘应用，采用 React 19 + Vite 6 + TypeScript 5.6 技术栈。

## 构建配置

### 构建脚本
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览构建结果

### 构建输出
- 输出目录: `dist/`
- 入口文件: `index.html`
- 静态资源: 自动优化和压缩

## 环境配置

### 开发环境
- 服务器: Vite 开发服务器
- 端口: 5173 (默认)
- 热重载: 已启用
- 代理: 如需配置可在 vite.config.ts 中设置

### 生产环境
- 服务器: 静态文件服务器
- 压缩: 启用 Gzip/Brotli 压缩
- 缓存: 静态资源长期缓存
- CDN: 建议部署到 CDN 以提高加载速度

## 环境变量

### 客户端环境变量
所有以 `VITE_` 开头的环境变量都会暴露给客户端代码：

```
# API 密钥
VITE_NEWS_API_KEY=your_news_api_key
VITE_MUSIC_API_KEY=your_music_api_key

# 云存储配置
VITE_S3_ACCESS_KEY=your_s3_access_key
VITE_S3_SECRET_KEY=your_s3_secret_key
VITE_S3_BUCKET_NAME=your_bucket_name
VITE_S3_REGION=your_region

# 应用配置
VITE_APP_TITLE=新闻聚合与音乐播放系统
VITE_API_BASE_URL=https://api.example.com
```

### 敏感信息处理
- 不要在客户端代码中暴露敏感密钥
- 使用环境变量管理 API 密钥
- 考虑使用后端代理保护敏感 API

## 部署平台配置

### Vercel
1. 连接 GitHub/GitLab/Bitbucket 仓库
2. 选择框架预设: Vite
3. 构建命令: `npm run build`
4. 输出目录: `dist`
5. 环境变量: 在项目设置中配置

### Netlify
1. 连接代码仓库
2. 构建命令: `npm run build`
3. 发布目录: `dist`
4. 环境变量: 在 Build & Deploy 设置中配置

### GitHub Pages
1. 安装 gh-pages: `npm install --save-dev gh-pages`
2. 添加部署脚本到 package.json:
   ```
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. 运行 `npm run deploy`

## 性能优化

### 代码分割
- 路由级别代码分割
- 组件懒加载
- 第三方库按需引入

### 资源优化
- 图片优化: 使用 WebP 格式
- 字体优化: 预加载关键字体
- CSS 优化: 移除未使用的样式

### 缓存策略
- 静态资源: 长期缓存 (1年)
- HTML 文件: 不缓存或短缓存
- API 请求: 合理设置缓存头

## 安全配置

### CSP (内容安全策略)
在 index.html 中配置 CSP 头部以防止 XSS 攻击

### HTTPS
- 强制使用 HTTPS
- 启用 HSTS
- 安全 Cookie 标记

## 监控和日志

### 错误监控
- 集成错误监控服务 (如 Sentry)
- 前端错误收集
- 性能指标监控

### 日志管理
- 客户端日志采样
- 错误报告机制
- 用户行为分析