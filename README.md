# Supabase S3 媒体管理器

这是一个基于 React 和 Tailwind CSS 构建的生产级媒体管理系统，专门针对 Supabase Storage 的 S3 兼容模式进行了深度优化和定制。

## 🔧 环境配置详细指南

### 1. 项目依赖安装
在您的本地 React 项目根目录中，执行以下命令安装必要的 AWS SDK 依赖：
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install wavesurfer.js
```

### 2. Supabase 平台配置步骤
- 登录 Supabase Dashboard 并导航至 Storage 管理页面
- 创建一个名为 "media" 的新存储桶（Bucket），用于存放所有媒体文件
- 进入 Settings -> API 页面，记录下您的 Project Ref（项目引用ID）和 Service Role Key（服务角色密钥）
- CORS 安全配置（至关重要）：在 Storage 设置的安全策略中，添加允许的域名（例如：http://localhost:3000 或生产环境域名），并确保允许以下 HTTP 方法：GET、PUT、POST、DELETE

### 3. S3 兼容性凭据获取
Supabase 提供的 S3 兼容端点信息如下：
- Endpoint（端点地址）：https://[your-project-id].supabase.co/storage/v1/s3
- Region（区域）：对应您 Supabase 实例所在的地理区域（例如：ap-southeast-1、us-east-1 等）
- Access Key（访问密钥）：使用您的 Supabase 项目 ID
- Secret Key（私有密钥）：使用您的 Supabase API 密钥（Service Role Key）

## 🚀 核心功能特性

- **S3 SDK 结构兼容性**：所有代码逻辑严格按照 @aws-sdk/client-s3 最佳实践规范实现，确保与标准 S3 操作完全兼容
- **智能媒体预览系统**：提供多种媒体类型的差异化预览功能，包括音频播放器（集成波形可视化模拟）、视频播放预览以及文档类型的基础预览
- **预签名 URL 管理**：完整实现了安全临时访问链接的生成、管理和验证机制，确保媒体文件的安全访问控制
- **响应式用户界面**：采用 Tailwind CSS 构建完全自适应的响应式设计，完美支持移动设备、平板和桌面端的各种屏幕尺寸
- **高级音频播放器**：集成了 WaveSurfer.js 波形可视化功能，提供专业的音频播放体验
- **全局通知系统**：统一的错误处理和用户反馈机制

## 📁 项目结构

```
src/
├── components/                 # React 组件
│   ├── MediaUploader.tsx       # 媒体上传组件
│   ├── MediaGallery.tsx        # 媒体库展示组件
│   ├── MediaPreviewModal.tsx   # 媒体预览模态框
│   ├── PresignedUrlManager.tsx # 预签名 URL 管理
│   ├── AdvancedAudioPlayer.tsx # 高级音频播放器
│   └── ...                     # 其他 UI 组件
├── services/                   # 业务逻辑服务
│   └── MediaService.ts         # 媒体服务核心逻辑
├── utils/                      # 工具函数
│   └── s3Client.ts             # S3 客户端配置
├── contexts/                   # React 上下文
│   └── NotificationContext.tsx # 通知上下文
└── App.tsx                     # 主应用组件
```

## ⚙️ 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# Supabase S3 配置
REACT_APP_SUPABASE_S3_ENDPOINT=https://your-project-id.supabase.co/storage/v1/s3
REACT_APP_SUPABASE_S3_REGION=ap-southeast-1
REACT_APP_SUPABASE_S3_ACCESS_KEY_ID=your-project-id
REACT_APP_SUPABASE_S3_SECRET_ACCESS_KEY=your-service-role-key
REACT_APP_SUPABASE_S3_BUCKET=media

# 其他配置
REACT_APP_DEBUG=true
```

## 🛠️ 开发启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build
```

## 📋 功能清单

- [x] S3 兼容客户端配置
- [x] 媒体上传功能
- [x] 媒体列表展示
- [x] 媒体预览功能
- [x] 预签名 URL 生成
- [x] 音频波形可视化
- [x] 响应式 UI 设计
- [x] 全局通知系统
- [x] 错误处理机制
- [x] 文件类型验证
- [x] 搜索和筛选功能

## 📝 许可证

MIT License