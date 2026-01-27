# API 使用指南

## 项目概述
本项目是一个新闻聚合与音乐播放系统的仪表盘应用，采用 React 19 + Vite 6 + TypeScript 5.6 技术栈。

## API 服务

### 新闻服务 (newsService)
- **功能**: 提供新闻搜索、获取和管理功能
- **主要方法**:
  - `getTopHeadlines()` - 获取头条新闻
  - `searchNews(query)` - 搜索新闻
  - `getNewsByCategory(category)` - 按类别获取新闻
  - `getApiUsageStats()` - 获取API使用统计

### 音乐服务 (musicService)
- **功能**: 提供音乐搜索、播放和收藏功能
- **主要方法**:
  - `searchMusic(query)` - 搜索音乐
  - `getRecommendations()` - 获取音乐推荐
  - `addToCollection(track)` - 添加到收藏
  - `getPlayerState()` - 获取播放器状态

### 存储服务 (storageService)
- **功能**: 提供云存储功能
- **主要方法**:
  - `uploadFile(file)` - 上传文件
  - `downloadFile(key)` - 下载文件
  - `listFiles(options)` - 列出文件

## 环境配置

### 环境变量
- `VITE_NEWS_API_KEY` - 新闻API密钥
- `VITE_MUSIC_API_KEY` - 音乐API密钥
- `VITE_S3_ACCESS_KEY` - S3访问密钥
- `VITE_S3_SECRET_KEY` - S3秘密密钥

## 速率限制
- 新闻API: 每分钟100次请求
- 音乐API: 每分钟50次请求
- 存储API: 每小时1000次请求

## 错误处理
所有API调用都应包含适当的错误处理逻辑，参考示例代码中的try-catch块。