<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# WYY AURA Personal Media Hub

**一个功能完整的个人媒体中心，集音乐、视频、付费内容和云存储管理于一体**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3.0-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC)](https://tailwindcss.com/)

</div>

## ✨ 功能特性

### 🎵 媒体中心
- **音乐库**：在线播放个人音乐收藏
- **视频中心**：流媒体播放个人视频内容
- **宝藏内容**：会员专属的优质资源
- **响应式设计**：适配桌面和移动设备

### ☁️ S3 云存储管理
- **文件管理**：上传、下载、删除、预览文件
- **智能搜索**：按文件名、日期、大小筛选
- **批量操作**：支持批量上传和删除
- **实时预览**：在线预览图片、文档等文件
- **权限控制**：双重认证（用户Token + 管理员密码）

### 💳 支付与订阅
- **订单创建**：生成唯一订单号
- **支付状态跟踪**：实时查询支付状态
- **订阅管理**：自动激活付费订阅
- **双重存储**：同时保存到Supabase和PostgreSQL

### 🔐 安全认证
- **用户认证**：Supabase身份验证系统
- **管理员权限**：密码保护的管理界面
- **API安全**：所有敏感操作需要双重认证
- **环境隔离**：严格区分客户端和服务端环境变量

### 🛠️ 开发者功能
- **数据库迁移**：一键执行SQL迁移脚本
- **支付对账**：自动同步支付状态
- **API文档**：完整的RESTful API接口
- **代码质量**：集成ESLint和TypeScript检查

## 🏗️ 技术栈

### 前端
- **Next.js 16.1.6** - React全栈框架
- **React 18.2.0** - UI组件库
- **TypeScript 5.7.2** - 类型安全
- **Tailwind CSS 3.4.17** - 实用优先的CSS框架
- **Lucide React** - 图标库

### 后端
- **Supabase** - 认证和数据库
- **AWS SDK v3** - S3兼容存储操作
- **PostgreSQL** - 关系型数据库
- **Next.js API Routes** - 服务器端API

### 开发工具
- **ESLint** - 代码规范检查
- **PostCSS** - CSS处理
- **Autoprefixer** - CSS前缀自动添加

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- Supabase账户（用于认证和存储）
- S3兼容存储（Supabase Storage或AWS S3）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd lovewwy
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   ```bash
   cp .env.example .env.local
   ```
   编辑 `.env.local` 文件，填入你的配置：
   ```env
   # Supabase 认证
   NEXT_PUBLIC_SUPABASE_AUTH_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # S3 兼容存储
   NEXT_PUBLIC_SUPABASE_S3_ENDPOINT=https://your-project-ref.storage.supabase.co/storage/v1/s3
   NEXT_PUBLIC_SUPABASE_S3_REGION=your-region
   NEXT_PUBLIC_SUPABASE_S3_ACCESS_KEY_ID=your-access-key-id
   NEXT_PUBLIC_SUPABASE_S3_SECRET_ACCESS_KEY=your-secret-access-key
   NEXT_PUBLIC_SUPABASE_S3_BUCKET=your-bucket-name
   
   # Edge Function
   NEXT_PUBLIC_FUNCTIONS_URL=https://your-project-ref.functions.supabase.co/s3-compat-storage
   
   # 支付集成
   NEXT_PUBLIC_PAYMENT_API_URL=https://your-payment-api.com
   PAYMENT_API_URL=https://your-payment-api.com
   
   # 安全密钥
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   MIGRATE_SECRET=a-strong-secret-here
   ```

4. **运行开发服务器**
   ```bash
   npm run dev
   ```
   访问 http://localhost:3000

5. **构建生产版本**
   ```bash
   npm run build
   npm start
   ```

## 📁 项目结构

```
lovewwy/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── admin/         # 管理员API
│   │   ├── list-files/    # 文件列表API
│   │   ├── payments/      # 支付API
│   │   └── subscriptions/ # 订阅API
│   ├── admin/             # 管理页面
│   ├── music/             # 音乐页面
│   ├── videos/            # 视频页面
│   ├── treasure/          # 宝藏页面
│   ├── profile/           # 用户资料
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── S3Admin.tsx        # S3管理界面
│   ├── AdminLoginModal.tsx # 管理员登录
│   ├── MusicHub.tsx       # 音乐中心
│   ├── VideoFeed.tsx      # 视频流
│   ├── TreasureBox.tsx    # 宝藏内容
│   └── ...其他组件
├── src/lib/               # 工具函数
│   ├── supabaseClient.ts  # Supabase客户端
│   └── auth.ts            # 认证工具
├── services/              # 业务服务
│   ├── storageService.ts  # 存储服务
│   ├── paymentService.ts  # 支付服务
│   └── postgresService.ts # 数据库服务
├── db/migrations/         # 数据库迁移
├── styles/                # 全局样式
└── public/                # 静态资源
```

## 🔧 API 接口

### 文件管理 API
- `GET /api/list-files` - 列出S3文件
- `POST /api/admin/migrate` - 数据库迁移（需要管理员密码）
- `POST /api/admin/reconcile` - 支付对账（需要管理员密码）

### 支付 API
- `POST /api/payments/create` - 创建订单
- `GET /api/payments/status` - 查询订单状态
- `POST /api/payments/confirm` - 确认支付并激活订阅

### 订阅 API
- `GET /api/subscriptions/status` - 查询用户订阅状态

## 🔒 安全特性

### 双重认证系统
所有敏感操作需要双重认证：
1. **用户Token**：从Supabase获取的访问令牌
2. **管理员密码**：通过props传递的管理员密码

### 环境变量安全
- `NEXT_PUBLIC_` 前缀：客户端可访问
- 无前缀：仅服务器端可访问
- 敏感密钥绝不暴露给客户端

### API 保护
- 所有管理API需要 `x-admin-password` 请求头
- 用户相关API需要 `Authorization: Bearer <token>` 请求头
- 数据库迁移需要额外的 `x-migrate-secret` 请求头

## 🚢 部署

### Vercel 部署（推荐）
1. 连接GitHub仓库到Vercel
2. 配置所有环境变量
3. 部署分支

### 环境变量配置（Vercel）
确保以下变量已配置：
- 所有 `NEXT_PUBLIC_` 开头的变量
- `SUPABASE_SERVICE_ROLE_KEY`
- `MIGRATE_SECRET`
- `DATABASE_URL`（如使用独立PostgreSQL）

### Supabase CORS 配置
在Supabase存储桶设置中：
1. 进入Storage → Buckets → 你的桶
2. 在CORS配置中添加你的生产域名
3. 保存更改

## 📊 数据库

### 表结构
```sql
-- 订阅表（示例）
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  order_no TEXT UNIQUE,
  status TEXT CHECK (status IN ('pending', 'active', 'cancelled')),
  tx_hash TEXT,
  amount DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 迁移脚本
项目包含数据库迁移系统：
```bash
# 通过API执行迁移
curl -X POST /api/admin/migrate \
  -H "x-migrate-secret: your-secret"
```

## 🧪 开发命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 安全审计
npm audit
```

## 🔄 更新日志

### 最新更新
- ✅ 升级Next.js到16.1.6，修复安全漏洞
- ✅ 重构authFetch为可复用模块
- ✅ 所有API路由添加动态导出
- ✅ 添加ESLint代码检查
- ✅ 完善TypeScript类型定义

### 近期计划
- [ ] 添加单元测试
- [ ] 实现文件分片上传
- [ ] 添加视频转码功能
- [ ] 优化移动端体验

## 📄 许可证

本项目仅供个人使用，保留所有权利。

## 🤝 贡献

欢迎提交Issue和Pull Request。

## 🆘 故障排除

### 常见问题
1. **S3文件列表为空**
   - 检查环境变量是否正确
   - 确认Supabase存储桶CORS配置
   - 验证管理员密码是否正确传递

2. **支付状态不同步**
   - 检查支付API连接
   - 验证SUPABASE_SERVICE_ROLE_KEY配置
   - 查看服务器日志

3. **构建失败**
   - 运行 `rm -rf .next node_modules package-lock.json && npm install`
   - 检查TypeScript类型错误
   - 验证环境变量完整性

### 获取帮助
- 查看项目文档
- 提交GitHub Issue
- 检查控制台错误信息

---

<div align="center">
<sub>Built with ❤️ using Next.js, React, and Supabase</sub>
</div>
