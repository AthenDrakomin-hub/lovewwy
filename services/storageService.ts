
/**
 * S3-Compatible Storage Utility
 * 
 * 在 Vercel 环境变量中配置：
 * S3_PUBLIC_BASE_URL = https://your-cdn-or-s3-public-url.com
 */

const PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL || '';

/**
 * 获取媒体文件的完整访问 URL
 * @param path 存储桶中的相对路径或完整的 http 链接
 */
export const getMediaUrl = (path: string): string => {
  // 如果路径已经是完整的 URL，直接返回
  if (!path || path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }

  // 确保前缀和路径之间有斜杠
  const baseUrl = PUBLIC_BASE_URL.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');

  if (!baseUrl) {
    console.warn('S3_PUBLIC_BASE_URL is not defined in environment variables.');
    // 降级尝试：如果是在开发环境且没配置，返回本地相对路径，否则返回空
    return `/${cleanPath}`;
  }

  return `${baseUrl}/${cleanPath}`;
};
