# Vercel 部署指南

## 📋 部署前检查清单

### ✅ 已完成的项目修复
1. **S3连接问题已修复** - 环境变量名称已正确配置
2. **动态数据加载系统** - 音乐和视频文件从S3动态加载
3. **中文映射系统** - 拼音文件名自动转换为中文显示
4. **分类标签系统** - 支持按分类和标签过滤

### 🔧 项目配置检查
- [x] Next.js 14.2.35 ✅
- [x] TypeScript 配置 ✅
- [x] Tailwind CSS 配置 ✅
- [x] 构建脚本配置 ✅ (`npm run build`)

## 🌐 Vercel 环境变量设置

### 步骤1: 登录Vercel并导入项目
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New" → "Project"
3. 导入你的GitHub/GitLab仓库
4. 选择项目根目录

### 步骤2: 配置环境变量
在Vercel项目设置中，添加以下环境变量：

#### **必需的环境变量 (S3存储)**
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_S3_PUBLIC_BASE_URL` | `https://zlbemopcgjohrnyyiwvs.storage.supabase.co/storage/v1/s3` | S3公共访问URL |
| `NEXT_PUBLIC_SUPABASE_S3_ENDPOINT` | `https://zlbemopcgjohrnyyiwvs.storage.supabase.co/storage/v1/s3` | S3端点 |
| `NEXT_PUBLIC_SUPABASE_S3_REGION` | `ap-south-1` | S3区域 |
| `NEXT_PUBLIC_SUPABASE_S3_ACCESS_KEY_ID` | `2160ce870540fd08f2eb07263230d1c3` | S3访问密钥ID |
| `NEXT_PUBLIC_SUPABASE_S3_SECRET_ACCESS_KEY` | `3a8741980dd7fe3ba6b6cd3c8924484a9b665b547958680a10d835b9d0724ed4` | S3秘密访问密钥 |
| `NEXT_PUBLIC_SUPABASE_S3_BUCKET` | `wangyiyun` | S3存储桶名称 |

#### **必需的环境变量 (Supabase认证)**
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_AUTH_URL` | `https://zlbemopcgjohrnyyiwvs.supabase.co` | Supabase认证URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `你的完整Anon Key` | **需要从Supabase获取完整密钥** |

**获取完整Anon Key的方法**:
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目 (`zlbemopcgjohrnyyiwvs`)
3. 进入 **Settings** → **API**
4. 复制 **anon public** 密钥 (以 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...` 开头)

#### **可选的环境变量**
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_FUNCTIONS_URL` | `https://zlbemopcgjohrnyyiwvs.functions.supabase.co/s3-compat-storage` | Edge Functions URL |
| `NEXT_PUBLIC_PAYMENT_API_URL` | `https://payment-tracker--athendrakomin.replit.app` | 支付API URL |
| `PAYMENT_API_URL` | `https://payment-tracker--athendrakomin.replit.app` | 服务器端支付API URL |
| `DATABASE_URL` | `postgresql://postgres:password@helium/heliumdb?sslmode=disable` | 数据库URL |
| `MIGRATE_SECRET` | `a-strong-secret-here` | 迁移密钥 |

### 步骤3: 环境变量分组
建议将环境变量分为两组：

#### **Production环境**
- 添加所有必需的环境变量
- 确保 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是完整且正确的

#### **Preview环境** (可选)
- 可以使用相同的环境变量
- 或创建测试环境配置

## 🚀 部署配置

### 构建配置
Vercel会自动检测Next.js项目，使用以下配置：
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 自定义域名 (可选)
1. 在Vercel项目设置中进入 **Domains**
2. 添加你的自定义域名
3. 按照指引配置DNS记录

## 🔍 部署后验证

### 1. 检查部署状态
- 访问Vercel提供的部署URL (如 `https://your-project.vercel.app`)
- 检查控制台是否有错误

### 2. 测试核心功能
- **S3连接测试**: 访问 `/api/list-files` 应返回文件列表
- **音乐页面**: 访问 `/music` 应显示21个音乐文件（中文标题）
- **视频页面**: 访问 `/videos` 应显示1个视频文件（中文标题）
- **分类过滤**: 测试分类按钮是否正常工作
- **标签显示**: 检查标签是否正确显示

### 3. 环境变量验证
```bash
# 在浏览器控制台检查环境变量
console.log('S3配置:', {
  endpoint: process.env.NEXT_PUBLIC_SUPABASE_S3_ENDPOINT,
  bucket: process.env.NEXT_PUBLIC_SUPABASE_S3_BUCKET
});
```

## 🛠️ 故障排除

### 常见问题1: S3连接失败
**症状**: `InvalidAccessKeyId` 错误
**解决方案**:
1. 检查环境变量名称是否正确（必须有 `NEXT_PUBLIC_SUPABASE_` 前缀）
2. 验证Access Key ID和Secret Access Key是否正确
3. 检查存储桶权限设置

### 常见问题2: Supabase认证失败
**症状**: 无法加载用户数据
**解决方案**:
1. 确保 `NEXT_PUBLIC_SUPABASE_AUTH_URL` 正确（不是functions URL）
2. 验证 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是完整且正确的
3. 检查Supabase项目是否启用认证

### 常见问题3: 构建失败
**症状**: Vercel部署失败
**解决方案**:
1. 检查 `package.json` 中的依赖版本
2. 确保TypeScript配置正确
3. 查看Vercel构建日志中的具体错误

## 📞 支持资源

- **Vercel文档**: https://vercel.com/docs
- **Next.js文档**: https://nextjs.org/docs
- **Supabase文档**: https://supabase.com/docs
- **项目GitHub**: [你的仓库地址]

## ✅ 部署就绪状态

**项目当前状态**: ✅ **可以部署到Vercel**

**已验证的功能**:
- [x] S3连接正常
- [x] 动态数据加载正常
- [x] 中文映射系统正常
- [x] 分类标签系统正常
- [x] 构建脚本正常 (`npm run build`)

**需要特别注意**:
1. **必须更新** `NEXT_PUBLIC_SUPABASE_ANON_KEY` 为完整密钥
2. 建议在部署前测试所有API端点
3. 监控首次部署的构建日志

---

**部署命令**:
```bash
# 本地测试构建
npm run build

# 如果构建成功，即可部署到Vercel
```

**部署后访问**:
- 主页面: `https://your-project.vercel.app`
- 音乐页面: `https://your-project.vercel.app/music`
- 视频页面: `https://your-project.vercel.app/videos`
- API测试: `https://your-project.vercel.app/api/list-files`