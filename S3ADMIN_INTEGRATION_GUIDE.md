# S3Admin 组件与 Edge Function 集成完整指南

## 概述

本指南说明如何使用更新后的 **S3Admin** 组件与部署的 Supabase Edge Function `s3-compat-storage` 进行交互。该组件已按照最佳安全实践进行了重构，确保：

1. **用户认证**：使用当前登录用户的 `access_token`（来自 Supabase Auth）
2. **管理员授权**：通过 `x-admin-password` header 验证管理员身份
3. **安全存储**：管理员密码**仅在内存中保存**，不会持久化到客户端存储

---

## 文件结构

已创建和修改以下文件：

```
src/lib/supabaseClient.ts          # ✅ 新建：Supabase 客户端 + getAccessToken 函数
components/S3Admin.tsx             # ✅ 已更新：接收 adminPassword 作为 prop
pages/AdminPage.tsx                # ✅ 已更新：保存密码状态并传入 S3Admin
.env.local                         # ✅ 已更新：添加 VITE_FUNCTIONS_URL
.env.example                       # ✅ 已更新：文档说明环境变量配置
```

---

## 环境变量配置

确保你的 `.env.local` 包含以下变量：

```dotenv
# Supabase 认证
VITE_SUPABASE_AUTH_URL="https://zlbemopcgjohrnyyiwvs.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"
VITE_SUPABASE_S3_BUCKET="wangyiyun"

# Edge Function 完整 URL
# 格式: https://YOUR_PROJECT_REF.functions.supabase.co/s3-compat-storage
VITE_FUNCTIONS_URL="https://zlbemopcgjohrnyyiwvs.functions.supabase.co/s3-compat-storage"
```

### 关键点
- **VITE_SUPABASE_AUTH_URL**：你的 Supabase 项目的基础 URL（不要包含 `/functions/v1/` 路径）
- **VITE_FUNCTIONS_URL**：Edge Function 的完整 URL，需要包含函数名 `/s3-compat-storage`

---

## 工作流程

### 1️⃣ 用户进入管理页面

用户访问 `/admin` 路由时，`AdminPage.tsx` 显示登录模态框（`AdminLoginModal.tsx`）

### 2️⃣ 输入管理员密码

在 `AdminLoginModal` 中输入密码，调用 `handleAdminLogin(password)`

### 3️⃣ 状态保存与 S3Admin 激活

```typescript
// AdminPage.tsx
const handleAdminLogin = (password: string) => {
  setAdminPassword(password);           // ✅ 保存到内存状态
  setIsAdminLoggedIn(true);
  setShowLogin(false);
  setShowDashboard(true);
};

// 渲染 S3Admin 时传入密码
{showS3Admin && <S3Admin adminPassword={adminPassword} />}
```

### 4️⃣ S3Admin 使用密码和用户 Token

```typescript
// S3Admin.tsx
const authFetch = async (path: string, opts: RequestInit = {}) => {
  if (!adminPassword) throw new Error('Admin password required');

  // 获取当前登录用户的 access_token
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated - no token available');

  // 构建请求 headers
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,           // ✅ 用户 token
    'x-admin-password': adminPassword,          // ✅ 管理员密码
  };

  // 发送请求到 Edge Function
  const url = `${FUNCTIONS_URL}${path}`;
  const res = await fetch(url, { ...opts, headers });
  ...
};
```

### 5️⃣ Edge Function 验证

你部署的 Edge Function `s3-compat-storage` 应该：

1. 从 header 中读取 `Authorization: Bearer <token>`
2. 使用 Supabase `auth.getUserByClaim()` 或 JWT 验证用户身份
3. 从 header 中读取 `x-admin-password`
4. 对比环境变量 `ADMIN_PASSWORD`（在 Supabase Functions Settings 中设置）
5. 如果都验证通过，执行 `/list`、`/get`、`/put`、`/delete` 等操作

---

## API 端点说明

`S3Admin` 与 Edge Function 交互的端点：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/list?bucket=X&prefix=Y&limit=Z` | GET | 列出对象 |
| `/get?key=X` | GET | 下载文件 |
| `/put?key=X` | PUT | 上传文件（body 为二进制） |
| `/delete?key=X` | DELETE | 删除文件 |

### 示例请求

#### 列出对象
```bash
curl -v \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>" \
  -H "x-admin-password: <ADMIN_PASSWORD>" \
  "https://zlbemopcgjohrnyyiwvs.functions.supabase.co/s3-compat-storage/list?bucket=wangyiyun&prefix=music/&limit=10"
```

#### 上传文件
```bash
curl -v -X PUT \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>" \
  -H "x-admin-password: <ADMIN_PASSWORD>" \
  --data-binary @song.mp3 \
  "https://zlbemopcgjohrnyyiwvs.functions.supabase.co/s3-compat-storage/put?key=music/song.mp3"
```

#### 下载文件
```bash
curl -v \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>" \
  -H "x-admin-password: <ADMIN_PASSWORD>" \
  "https://zlbemopcgjohrnyyiwvs.functions.supabase.co/s3-compat-storage/get?key=music/song.mp3" \
  -o song.mp3
```

#### 删除文件
```bash
curl -v -X DELETE \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>" \
  -H "x-admin-password: <ADMIN_PASSWORD>" \
  "https://zlbemopcgjohrnyyiwvs.functions.supabase.co/s3-compat-storage/delete?key=music/song.mp3"
```

---

## 测试步骤

### 本地测试

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问管理页面**
   - 打开浏览器访问 `http://localhost:5173/admin`
   - 在 `AdminLoginModal` 中输入管理员密码

3. **验证 S3Admin 组件**
   - 点击 "S3 Admin" 标签切换到文件管理界面
   - 看到 "List Objects"、"Upload File" 等操作表单
   - 点击 "List Objects" 获取存储桶中的文件列表

4. **尝试各种操作**
   - **List**：查看文件列表
   - **Download**：下载文件到本地
   - **Upload**：选择本地文件并上传
   - **Delete**：删除文件（需确认）

### 调试技巧

- **浏览器 DevTools - Network 标签**：查看请求 headers 和响应
- **Supabase 控制台 - Functions 日志**：查看 Edge Function 执行日志
- **浏览器控制台**：查看 `console.error()` 和 `console.log()`

---

## 安全建议

### ✅ 当前实现（安全）

- 管理员密码**仅存储在内存中**（React state）
- 页面刷新或关闭后自动清除
- 不会被编译进静态资源
- 每次请求都需要提供 token 和密码

### ⚠️ 更进一步的安全措施

1. **使用短期令牌**（推荐）
   - 管理员在后端验证密码
   - 后端签发 JWT token（例如 15 分钟有效期）
   - 前端仅保存短期 token
   - Edge Function 验证 token 而不是密码

2. **IP 限制**
   - Edge Function 限制只接受特定 IP 范围的请求
   - 例如：仅允许公司 VPN 的 IP

3. **审计日志**
   - 在 Edge Function 中记录所有操作（谁、干了什么、何时）
   - 存储到 Supabase 数据库表中

4. **RBAC（基于角色的访问控制）**
   - 在 Supabase Auth 中为管理员用户添加 custom claims
   - Edge Function 检查 JWT 中的 claims 而不是仅检查密码

---

## 常见问题

### Q: 为什么需要两个 headers？
**A:** 
- `Authorization: Bearer <token>`：证明你是登录用户（Supabase Auth 验证）
- `x-admin-password: <password>`：证明你有管理员权限（密码验证）

这是分层防御：即使 token 被盗用，没有密码仍无法操作存储。

### Q: 如果我忘记了管理员密码怎么办？
**A:** 
- 页面刷新 → 需要重新登录
- 修改 Edge Function Settings 中的 `ADMIN_PASSWORD` 环境变量
- 重新部署 Edge Function

### Q: 为什么 S3Admin 组件显示 "请先通过管理员登录"？
**A:** 
- `adminPassword` prop 为空或 undefined
- 确认 `AdminPage.tsx` 中的 `handleAdminLogin()` 被正确调用
- 检查浏览器控制台有无错误

### Q: 上传大文件时报错怎么办？
**A:** 
- Edge Function 可能有超时限制（通常 600 秒）
- Supabase 存储桶可能有大小限制
- 查看 Supabase 控制台的 Functions 日志获取详细错误

### Q: VITE_FUNCTIONS_URL 如何确定？
**A:** 
1. 进入 Supabase 项目控制台
2. 左侧菜单 → Functions
3. 找到 `s3-compat-storage` 函数
4. 在函数详情中可以看到完整 URL
5. 格式通常为：`https://PROJECT_REF.functions.supabase.co/s3-compat-storage`

---

## 快速参考

### 导入 getAccessToken

```typescript
import { getAccessToken } from '../lib/supabaseClient';

// 使用
const token = await getAccessToken();
```

### 向 S3Admin 传递密码

```typescript
// AdminPage.tsx
<S3Admin 
  adminPassword={adminPassword} 
  edgeBaseUrl="https://... .functions.supabase.co/s3-compat-storage"
/>
```

### S3Admin Props

```typescript
type Props = {
  adminPassword?: string;  // 管理员密码（必须）
  edgeBaseUrl?: string;    // Edge Function 完整 URL（可选，默认读取 VITE_FUNCTIONS_URL）
  defaultBucket?: string;  // 默认存储桶（可选，默认 'wangyiyun'）
};
```

---

## 部署 Edge Function 的相关资源

确保你的 Edge Function 包含以下环境变量设置（在 Supabase 控制台中）：

```env
ADMIN_PASSWORD=你的管理员密码
```

Edge Function 应该处理的请求：
- ✅ `/list` - 列出对象
- ✅ `/get` - 下载文件
- ✅ `/put` - 上传文件
- ✅ `/delete` - 删除文件

---

## 总结

| 组件 | 职责 |
|------|------|
| **AdminLoginModal** | 收集管理员密码 |
| **AdminPage** | 保存密码到 state，管理标签页切换 |
| **S3Admin** | 使用密码 + token 向 Edge Function 发送请求 |
| **supabaseClient.ts** | 提供 `getAccessToken()` 函数获取用户 token |
| **Edge Function** | 验证 token 和密码，执行 S3 操作 |

---

**最后更新**：2026年2月1日
