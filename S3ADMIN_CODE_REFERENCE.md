# 🔑 S3Admin 集成核心代码参考

## 1️⃣ supabaseClient.ts - 获取用户 Token

**位置**：`src/lib/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_AUTH_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

/**
 * 获取当前登录用户的 access_token
 * 用于向 Edge Function 发送认证请求
 * @returns {Promise<string | null>} 用户的 access_token，或 null 如果未登录
 */
export const getAccessToken = async (): Promise<string | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};
```

### 使用示例

```typescript
import { getAccessToken } from '../lib/supabaseClient';

// 在任何组件中获取 token
const token = await getAccessToken();
if (token) {
  console.log('用户已登录，token:', token);
} else {
  console.log('用户未登录');
}
```

---

## 2️⃣ AdminPage.tsx - 管理员密码管理

**位置**：`pages/AdminPage.tsx`

### 关键代码片段

```typescript
import React, { useState } from 'react';
import AdminLoginModal from '../components/AdminLoginModal';
import S3Admin from '../components/S3Admin';

const AdminPage: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');  // ✅ 密码状态
  const [showS3Admin, setShowS3Admin] = useState(false);

  // ✅ 保存管理员密码到内存状态
  const handleAdminLogin = (password: string) => {
    setAdminPassword(password);
    setIsAdminLoggedIn(true);
    setShowLogin(false);
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {isAdminLoggedIn ? (
        <div className="pt-24">
          {/* 标签页导航 */}
          <button onClick={() => setShowS3Admin(true)}>S3 Admin</button>
          
          {/* ✅ 传入密码 prop */}
          {showS3Admin && <S3Admin adminPassword={adminPassword} />}
        </div>
      ) : (
        <AdminLoginModal onLogin={handleAdminLogin} />
      )}
    </div>
  );
};

export default AdminPage;
```

### 关键要点

1. **状态管理**：`adminPassword` 存储在内存中（React state）
2. **无持久化**：不要写入 localStorage、sessionStorage 或 cookies
3. **自动清除**：页面刷新或关闭时自动清除
4. **传递给子组件**：通过 props 传入 S3Admin

---

## 3️⃣ S3Admin.tsx - 核心实现

**位置**：`components/S3Admin.tsx`

### Props 定义

```typescript
type Props = {
  adminPassword?: string;       // 必须：管理员密码
  edgeBaseUrl?: string;         // 可选：Edge Function URL
  defaultBucket?: string;       // 可选：默认存储桶
};
```

### 认证请求实现

```typescript
import { getAccessToken } from '../lib/supabaseClient';

const S3Admin: React.FC<Props> = ({
  adminPassword,
  edgeBaseUrl = '',
  defaultBucket = import.meta.env.VITE_SUPABASE_S3_BUCKET || 'wangyiyun',
}) => {
  // ✅ 使用环境变量或 props 提供的 URL
  const FUNCTIONS_URL =
    edgeBaseUrl ||
    (import.meta.env.VITE_FUNCTIONS_URL as string) ||
    '';

  // ✅ 核心：带认证的 fetch 函数
  const authFetch = async (path: string, opts: RequestInit = {}) => {
    // 检查管理员密码
    if (!adminPassword) throw new Error('Admin password required');

    // 获取用户 token
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated - no token available');

    // ✅ 构建请求 headers
    const headers: Record<string, string> = {
      ...(opts.headers as Record<string, string>) || {},
      Authorization: `Bearer ${token}`,           // ✅ 用户认证
      'x-admin-password': adminPassword,          // ✅ 管理员认证
    };

    // 设置 Content-Type（仅当需要时）
    if (
      !(opts.body instanceof FormData) &&
      !(opts.body instanceof Blob) &&
      !headers['Content-Type']
    ) {
      headers['Content-Type'] = 'application/json';
    }

    // 发送请求
    const url = `${FUNCTIONS_URL}${path}`;
    const res = await fetch(url, { ...opts, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res;
  };

  // ✅ List 操作示例
  const listObjects = async () => {
    try {
      setStatus('Loading...');
      const qs = `?bucket=${encodeURIComponent(defaultBucket)}&prefix=${encodeURIComponent(prefix)}&limit=${limit}`;
      const res = await authFetch(`/list${qs}`, { method: 'GET' });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || data.objects || data.files || []);
      setStatus('Loaded');
    } catch (err: any) {
      setStatus(err.message || 'Error listing objects');
    }
  };

  // ✅ Upload 操作示例
  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    const key = uploadKey || file?.name;
    if (!file || !key) {
      setStatus('Choose file and set key');
      return;
    }
    try {
      setStatus('Uploading...');
      await authFetch(`/put?key=${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: file,  // ✅ 直接传入 File 对象
      });
      setStatus('Uploaded');
      await listObjects();
    } catch (err: any) {
      setStatus(err.message || 'Error uploading');
    }
  };

  // ✅ Download 操作示例
  const download = async (key: string) => {
    try {
      setStatus('Downloading...');
      const res = await authFetch(`/get?key=${encodeURIComponent(key)}`, { method: 'GET' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = key.split('/').pop() || key;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('Downloaded');
    } catch (err: any) {
      setStatus(err.message || 'Error downloading');
    }
  };

  // ✅ Delete 操作示例
  const remove = async (key: string) => {
    if (!confirm(`Delete ${key}?`)) return;
    try {
      setStatus('Deleting...');
      await authFetch(`/delete?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
      setStatus('Deleted');
      await listObjects();
    } catch (err: any) {
      setStatus(err.message || 'Error deleting');
    }
  };

  // ✅ 当密码改变时重新加载
  useEffect(() => {
    if (adminPassword) {
      listObjects().catch((e) => setStatus(e.message || 'List error'));
    }
  }, [adminPassword]);

  // ✅ 未认证时的提示
  if (!adminPassword) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 pt-12 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">S3 Storage Admin</h1>
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-6 text-yellow-200">
            请先通过管理员登录以使用此界面。
          </div>
        </div>
      </div>
    );
  }

  // ✅ 已认证时显示完整 UI
  return (
    // ... UI 代码
  );
};
```

---

## 4️⃣ 环境变量配置

**位置**：`.env.local`

```dotenv
# Supabase 认证配置
VITE_SUPABASE_AUTH_URL="https://zlbemopcgjohrnyyiwvs.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGc..."

# S3 存储配置
VITE_SUPABASE_S3_BUCKET="wangyiyun"

# ✅ Edge Function URL（关键）
# 格式: https://PROJECT_REF.functions.supabase.co/s3-compat-storage
VITE_FUNCTIONS_URL="https://zlbemopcgjohrnyyiwvs.functions.supabase.co/s3-compat-storage"
```

---

## 5️⃣ Edge Function Headers 说明

### 请求格式

```
GET https://zlbemopcgjohrnyyiwvs.functions.supabase.co/s3-compat-storage/list

Headers:
├── Authorization: Bearer eyJhbGc...       (✅ 用户 access_token)
├── x-admin-password: admin123            (✅ 管理员密码)
└── Content-Type: application/json        (根据需要)
```

### Header 用途

| Header | 用途 | 来源 |
|--------|------|------|
| `Authorization: Bearer <token>` | 验证用户身份 | `getAccessToken()` |
| `x-admin-password: <password>` | 验证管理员权限 | Props `adminPassword` |
| `Content-Type` | 指定请求体格式 | 自动设置 |

---

## 6️⃣ 错误处理模式

```typescript
// 标准的 try-catch 模式
const operation = async () => {
  try {
    setStatus('操作中...');
    
    // ✅ 调用 authFetch
    const res = await authFetch('/list', { method: 'GET' });
    const data = await res.json();
    
    // 处理响应
    setItems(data);
    setStatus('成功');
  } catch (err: any) {
    // ✅ 清晰的错误消息
    if (err.message.includes('HTTP 403')) {
      setStatus('错误：密码错误或权限不足');
    } else if (err.message.includes('HTTP 401')) {
      setStatus('错误：未登录或 token 过期');
    } else if (err.message.includes('Admin password required')) {
      setStatus('错误：需要管理员密码');
    } else {
      setStatus(err.message || '未知错误');
    }
  }
};
```

### 常见错误代码

| 代码 | 原因 | 解决 |
|------|------|------|
| 401 | 无效或过期的 token | 重新登录 Supabase |
| 403 | 密码错误或无权限 | 检查 ADMIN_PASSWORD |
| 404 | 端点不存在 | 检查 VITE_FUNCTIONS_URL |
| 500 | Edge Function 错误 | 查看 Supabase Functions 日志 |

---

## 7️⃣ 测试代码示例

### 本地单元测试

```typescript
import { getAccessToken } from '../src/lib/supabaseClient';

describe('S3Admin Integration', () => {
  test('getAccessToken should return token for logged-in user', async () => {
    // 假设用户已登录
    const token = await getAccessToken();
    expect(token).not.toBeNull();
    expect(typeof token).toBe('string');
  });

  test('authFetch should include required headers', async () => {
    // Mock fetch 来验证 headers
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    // 调用 S3Admin 的 authFetch
    // 验证 headers 包含 Authorization 和 x-admin-password
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer'),
          'x-admin-password': expect.any(String),
        }),
      })
    );
  });
});
```

### 手动 curl 测试

```bash
# 1. 获取用户 token（需要已登录）
# 在浏览器控制台执行：
# import { getAccessToken } from './src/lib/supabaseClient';
# const token = await getAccessToken();
# console.log(token);

USER_TOKEN="eyJhbGc..."
ADMIN_PASSWORD="admin123"
FUNCTIONS_URL="https://zlbemopcgjohrnyyiwvs.functions.supabase.co/s3-compat-storage"

# 2. 测试 List 端点
curl -v \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "x-admin-password: $ADMIN_PASSWORD" \
  "$FUNCTIONS_URL/list?bucket=wangyiyun&prefix=music/&limit=10"

# 3. 测试 Upload 端点
curl -v -X PUT \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "x-admin-password: $ADMIN_PASSWORD" \
  --data-binary @song.mp3 \
  "$FUNCTIONS_URL/put?key=music/song.mp3"

# 4. 预期响应
# HTTP/1.1 200 OK          ✅ 成功
# HTTP/1.1 403 Forbidden   ❌ 密码错误
# HTTP/1.1 401 Unauthorized ❌ token 过期
```

---

## 8️⃣ 集成检查清单

部署前的验证清单：

### 代码检查
- [ ] `src/lib/supabaseClient.ts` 已创建
- [ ] `components/S3Admin.tsx` 已更新为接收 props
- [ ] `pages/AdminPage.tsx` 保存密码到 state
- [ ] 所有导入路径正确
- [ ] 没有 TypeScript 编译错误

### 环境变量检查
- [ ] `.env.local` 中 `VITE_FUNCTIONS_URL` 正确
- [ ] `VITE_SUPABASE_AUTH_URL` 不包含 `/functions/v1/` 路径
- [ ] `VITE_SUPABASE_ANON_KEY` 有效

### Edge Function 检查
- [ ] `s3-compat-storage` 函数已部署
- [ ] 环境变量 `ADMIN_PASSWORD` 已设置
- [ ] 函数支持 `/list`、`/get`、`/put`、`/delete` 端点

### 测试检查
- [ ] 本地 `npm run dev` 能正常启动
- [ ] 登录后能访问 `/admin` 页面
- [ ] 输入密码后 S3Admin 显示
- [ ] 能成功列出 S3 中的文件
- [ ] 能成功上传、下载、删除文件

---

## 9️⃣ 快速参考表

### 文件与职责

| 文件 | 职责 |
|------|------|
| `src/lib/supabaseClient.ts` | 提供 `getAccessToken()` |
| `components/S3Admin.tsx` | UI + 文件操作逻辑 |
| `pages/AdminPage.tsx` | 密码管理 + 路由 |
| `.env.local` | 环境配置 |
| `Edge Function` | 请求验证 + S3 操作 |

### 请求流程

```
S3Admin 组件
  ↓
getAccessToken() 获取 token
  ↓
authFetch() 构建请求
  ├─ Authorization header (token)
  └─ x-admin-password header
  ↓
Edge Function
  ├─ 验证 token
  ├─ 验证密码
  └─ 执行 S3 操作
  ↓
返回结果给前端
```

### 数据流向

```
AdminLoginModal
  ↓ password
AdminPage (state: adminPassword)
  ↓ prop
S3Admin
  ↓ authFetch
Edge Function
  ↓ S3 操作
Supabase Storage
```

---

## 🔟 最佳实践

### ✅ 务必执行

```typescript
// ✅ 使用 try-catch 捕获错误
try {
  const result = await authFetch('/list', { method: 'GET' });
} catch (err) {
  console.error('操作失败:', err);
}

// ✅ 检查 adminPassword
if (!adminPassword) {
  return <div>请先登录管理员</div>;
}

// ✅ 使用 getAccessToken() 获取用户 token
const token = await getAccessToken();
if (!token) {
  throw new Error('用户未登录');
}
```

### ❌ 不要这样做

```typescript
// ❌ 不要把密码存在 localStorage
localStorage.setItem('adminPassword', password);

// ❌ 不要把密码写在代码中
const ADMIN_PASSWORD = 'admin123';

// ❌ 不要在环境变量中暴露 ADMIN_PASSWORD
VITE_ADMIN_PASSWORD=admin123

// ❌ 不要在请求中省略 Authorization header
fetch(url, {
  headers: {
    'x-admin-password': adminPassword,  // ❌ 缺少 Authorization
  },
});
```

---

**最后更新**：2026年2月1日  
**维护者**：AI Assistant  
**版本**：1.0.0
