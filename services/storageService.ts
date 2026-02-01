/**
 * S3-Compatible Storage Utility
 * 
 * 在 Vercel 环境变量中配置：
 * VITE_S3_PUBLIC_BASE_URL = https://your-cdn-or-s3-public-url.com
 */

const PUBLIC_BASE_URL = import.meta.env.VITE_S3_PUBLIC_BASE_URL || '';

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

/**
 * 获取存储桶中的文件列表
 * 注意：这需要一个支持 ListObjects 的后端API或Edge Function
 */
export const listBucketContents = async (): Promise<any[]> => {
  try {
    // 这里需要一个后端API或Edge Function来列出存储桶中的文件
    // 由于浏览器端无法直接列出S3存储桶内容，需要通过后端API实现
    const response = await fetch('/api/list-files', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing bucket contents:', error);
    return [];
  }
};

/**
 * 获取存储桶中的音乐文件列表
 */
export const listMusicFiles = async (): Promise<any[]> => {
  try {
    // 从环境变量获取音乐文件路径
    const musicPath = 'music/';
    const allFiles = await listBucketContents();
    return allFiles.filter((file: any) => 
      file.path?.startsWith(musicPath) && 
      (file.path.endsWith('.mp3') || file.path.endsWith('.wav') || file.path.endsWith('.flac'))
    );
  } catch (error) {
    console.error('Error listing music files:', error);
    return [];
  }
};

/**
 * 获取存储桶中的视频文件列表
 */
export const listVideoFiles = async (): Promise<any[]> => {
  try {
    // 从环境变量获取视频文件路径
    const videoPath = 'videos/';
    const allFiles = await listBucketContents();
    return allFiles.filter((file: any) => 
      file.path?.startsWith(videoPath) && 
      (file.path.endsWith('.mp4') || file.path.endsWith('.avi') || file.path.endsWith('.mov'))
    );
  } catch (error) {
    console.error('Error listing video files:', error);
    return [];
  }
};