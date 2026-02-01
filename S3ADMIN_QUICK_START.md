# 🚀 S3Admin 快速入门指南（5 分钟）

## ⚡ 极速上手

### Step 1️⃣ - 验证环境配置（30 秒）

打开 `.env.local`，检查这些变量：

```dotenv
✅ VITE_SUPABASE_AUTH_URL=https://zlbemopcgjohrnyyiwvs.supabase.co
✅ VITE_SUPABASE_ANON_KEY=eyJhbGc...
✅ VITE_FUNCTIONS_URL=https://zlbemopcgjohrnyyiwvs.functions.supabase.co/s3-compat-storage
✅ VITE_SUPABASE_S3_BUCKET=wangyiyun
```

**需要调整 VITE_FUNCTIONS_URL？**

进入 Supabase 控制台 → Functions → 点击 `s3-compat-storage` → 复制完整 URL

---

### Step 2️⃣ - 启动开发服务器（30 秒）

```bash
npm run dev
```

打开浏览器访问：`http://localhost:5173/admin`

---

### Step 3️⃣ - 登录管理员账户（1 分钟）

1. 输入管理员密码（与 Edge Function 环境变量 `ADMIN_PASSWORD` 一致）
2. 点击 "确认" 或 "登录"
3. 看到 "Dashboard" 和 "S3 Admin" 两个标签

---

### Step 4️⃣ - 访问 S3 Admin（1 分钟）

1. 点击 "S3 Admin" 标签
2. 应该看到：
   - "List Objects" 输入框和按钮
   - "Upload File" 文件选择框
   - 文件列表展示区域

3. 点击 "List Objects" 按钮查看存储桶中的文件

---

### Step 5️⃣ - 尝试文件操作（2 分钟）

#### 📋 列表操作
```
输入 prefix：music/
点击 "List Objects"
↓
看到 music/ 目录下的所有文件
```

#### 📤 上传操作
```
选择本地文件
输入上传 key：music/my-song.mp3
点击 "Upload"
↓
状态显示 "Uploaded"
```

#### 📥 下载操作
```
在文件列表找到目标文件
点击 "Download" 按钮
↓
文件下载到本地
```

#### 🗑️ 删除操作
```
找到要删除的文件
点击 "Delete" 按钮
确认删除
↓
文件被删除，列表自动刷新
```

---

## 🎯 核心概念（1 分钟速览）

### 双重认证

```
你的 Token (Supabase Auth)
    +
管理员密码 (内存存储)
    =
完整权限 ✅
```

### 请求示例

```
GET /list
Headers:
  Authorization: Bearer <你的token>
  x-admin-password: <你输入的密码>
```

### 文件操作位置

| 操作 | 代码位置 |
|------|---------|
| 获取 Token | `src/lib/supabaseClient.ts` |
| 密码管理 | `pages/AdminPage.tsx` |
| 文件操作 | `components/S3Admin.tsx` |
| Edge Function | Supabase 控制台 |

---

## ❓ 常见问题速答

### Q: 密码保存在哪？
**A:** 仅在浏览器内存中，刷新页面消失。安全 ✅

### Q: 为什么需要两个验证？
**A:** 
- Token = 证明你是登录用户
- 密码 = 证明你是管理员

两个都需要才能操作文件。更安全！

### Q: 上传失败怎么办？
**A:** 查看浏览器控制台的错误信息：
- `HTTP 403` → 密码错误
- `HTTP 401` → Token 过期，重新登录
- 其他错误 → 查看 Supabase Functions 日志

### Q: 为什么没有看到文件？
**A:** 
1. 检查 `prefix` 是否正确（如 `music/`）
2. 确认文件确实存在
3. 点击 "List Objects" 按钮刷新

---

## 🐛 快速调试

### 打开浏览器开发者工具

```
F12 或 右键 → 检查
```

### 查看请求头

```
Network 标签 → 点击请求 → Headers 标签
看 Authorization 和 x-admin-password 是否正确
```

### 查看响应

```
Network 标签 → 点击请求 → Preview 或 Response 标签
看是否有错误信息
```

### 查看 Supabase 日志

```
Supabase 控制台
  → Functions
  → 点击 s3-compat-storage
  → Logs 标签
看最近的请求日志和错误
```

---

## 📱 API 快速参考

### List（列出文件）
```bash
curl https://...functions.supabase.co/s3-compat-storage/list \
  -H "Authorization: Bearer TOKEN" \
  -H "x-admin-password: PASSWORD" \
  -G --data-urlencode "bucket=wangyiyun" \
      --data-urlencode "prefix=music/" \
      --data-urlencode "limit=10"
```

### Get（下载文件）
```bash
curl https://...functions.supabase.co/s3-compat-storage/get \
  -H "Authorization: Bearer TOKEN" \
  -H "x-admin-password: PASSWORD" \
  -G --data-urlencode "key=music/song.mp3" \
  -o song.mp3
```

### Put（上传文件）
```bash
curl -X PUT https://...functions.supabase.co/s3-compat-storage/put \
  -H "Authorization: Bearer TOKEN" \
  -H "x-admin-password: PASSWORD" \
  -G --data-urlencode "key=music/song.mp3" \
  --data-binary @song.mp3
```

### Delete（删除文件）
```bash
curl -X DELETE https://...functions.supabase.co/s3-compat-storage/delete \
  -H "Authorization: Bearer TOKEN" \
  -H "x-admin-password: PASSWORD" \
  -G --data-urlencode "key=music/song.mp3"
```

---

## ✅ 检查清单

启动前：
- [ ] `.env.local` 已配置
- [ ] `npm install` 已运行
- [ ] Supabase 登录状态正常

启动后：
- [ ] `npm run dev` 运行成功
- [ ] 浏览器能访问 `/admin`
- [ ] 能输入管理员密码
- [ ] S3Admin 界面显示

操作测试：
- [ ] 能列出文件
- [ ] 能上传文件
- [ ] 能下载文件
- [ ] 能删除文件

---

## 🆘 紧急排查

### 什么都不显示？

```bash
1. 查看浏览器控制台：F12 → Console
2. 看有没有红色错误
3. 查看 Network 标签：看请求是否成功
```

### 说 "请先通过管理员登录"？

```bash
1. 检查 AdminPage.tsx 中 handleAdminLogin() 是否被调用
2. 确认输入的密码与 Edge Function 中的 ADMIN_PASSWORD 一致
3. 检查浏览器控制台有无 JavaScript 错误
```

### 上传失败？

```bash
1. 查看浏览器 Network 标签：HTTP 状态码是什么？
2. 查看 Supabase Functions 日志
3. 确认文件大小不超过限制
4. 确认文件名中没有特殊字符
```

---

## 📞 获取帮助

### 查看完整文档
- 📖 [S3ADMIN_INTEGRATION_GUIDE.md](S3ADMIN_INTEGRATION_GUIDE.md)
- 💻 [S3ADMIN_CODE_REFERENCE.md](S3ADMIN_CODE_REFERENCE.md)
- ✅ [S3ADMIN_IMPLEMENTATION_CHECKLIST.md](S3ADMIN_IMPLEMENTATION_CHECKLIST.md)

### 检查代码
- 🔍 [components/S3Admin.tsx](components/S3Admin.tsx)
- 🔍 [pages/AdminPage.tsx](pages/AdminPage.tsx)
- 🔍 [src/lib/supabaseClient.ts](src/lib/supabaseClient.ts)

### Supabase 官方资源
- https://supabase.com/docs
- https://supabase.com/docs/guides/functions
- https://supabase.com/docs/guides/storage

---

## 🎉 现在开始吧！

```bash
npm run dev
# 访问 http://localhost:5173/admin
# 输入管理员密码
# 点击 S3 Admin
# 开始管理文件 🚀
```

---

**提示**：如果遇到任何问题，先查看浏览器控制台的错误信息，这通常能快速指出问题所在。

**Last Updated**：2026年2月1日
