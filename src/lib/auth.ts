/**
 * 带身份认证的请求封装函数
 * 用于向需要双重认证（用户Token + 管理员密码）的API发送请求
 * 
 * @param path API路径（不包含基础URL）
 * @param opts 请求配置
 * @param adminPassword 管理员密码（可选，如果未提供则从调用方传递）
 * @param baseUrl 基础URL（可选，如果未提供则使用环境变量或空字符串）
 * @returns 返回fetch Response对象
 */
export const authFetch = async (
  path: string, 
  opts: RequestInit = {}, 
  adminPassword?: string,
  baseUrl?: string
) => {
  // 检查管理员密码
  if (!adminPassword) {
    throw new Error('Admin password required for authFetch');
  }

  // 获取用户 token - 需要从 supabaseClient 导入
  const { getAccessToken } = await import('./supabaseClient');
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated - no token available');
  }

  // 构建请求 headers
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string>) || {},
    Authorization: `Bearer ${token}`,           // 用户认证
    'x-admin-password': adminPassword,          // 管理员认证
  };

  // 设置 Content-Type（仅当需要时）
  if (
    !(opts.body instanceof FormData) &&
    !(opts.body instanceof Blob) &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json';
  }

  // 确定基础URL
  const functionsUrl = baseUrl || 
    (process.env.NEXT_PUBLIC_FUNCTIONS_URL as string) || 
    '';

  // 发送请求
  const url = `${functionsUrl}${path}`;
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res;
};

/**
 * 创建带预设配置的 authFetch 函数（工厂函数）
 * 用于组件内部使用，避免重复传递 adminPassword 和 baseUrl
 * 
 * @param adminPassword 管理员密码
 * @param baseUrl 基础URL
 * @returns 预设了 adminPassword 和 baseUrl 的 authFetch 函数
 */
export const createAuthFetch = (adminPassword: string, baseUrl: string = '') => {
  return (path: string, opts: RequestInit = {}) => 
    authFetch(path, opts, adminPassword, baseUrl);
};
