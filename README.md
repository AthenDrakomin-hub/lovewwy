<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 新闻聚合与音乐播放系统

这是一个使用 React 19、Vite 6 和 TypeScript 5.6 构建的仪表盘级新闻聚合与音乐播放系统。系统采用深色主题设计，主色调为科技蓝(#00f2ff)，集成了新闻API和音乐API，提供实时新闻浏览和音乐播放功能。

## 功能特性

- 新闻浏览：支持分类浏览、搜索和收藏
- 音乐播放：音乐搜索和播放功能
- API监控：实时监控API使用情况
- 响应式设计：适配不同屏幕尺寸
- 统一组件体系：包含公共基础组件和业务组件
- 深色主题：科技感十足的深色界面设计
- 存储服务：通过Supabase Edge Functions进行安全的S3存储操作

## 运行本地开发

**前置要求:** Node.js

1. 安装依赖:
   `npm install`
2. 配置环境变量：在 [.env.local](.env.local) 中设置必要的API密钥和配置
3. 运行应用:
   `npm run dev`

## 环境配置

确保在环境文件中正确配置以下变量：
- `VITE_NEWS_API_KEY` - NewsAPI密钥
- `VITE_SUPABASE_AUTH_URL` - Supabase Edge Functions URL
- `VITE_AWS_S3_*` - AWS S3兼容存储配置
- `GEMINI_API_KEY` - Gemini API密钥

## Supabase Edge Functions 配置

当前配置的Edge Functions URL为：
`VITE_SUPABASE_AUTH_URL=https://zlbemopcgjohrnyyiwvs.functions.supabase.co/unlock-storage-token`
