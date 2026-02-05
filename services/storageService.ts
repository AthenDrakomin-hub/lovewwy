/**
 * S3-Compatible Storage Utility
 * 
 * 在 Vercel 环境变量中配置：
 * VITE_S3_PUBLIC_BASE_URL = https://your-cdn-or-s3-public-url.com
 */

const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL || '';

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
export const listBucketContents = async (bucket?: string, prefix?: string): Promise<any[]> => {
  try {
    const url = `/api/list-files${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''}`;
    const response = await fetch(url, {
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

/**
 * 初始化分片上传
 * @param filename 文件名
 * @param contentType 文件类型，默认为 'application/octet-stream'
 */
export const initiateMultipartUpload = async (filename: string, contentType: string = 'application/octet-stream'): Promise<{ uploadId: string; key: string }> => {
  try {
    const response = await fetch('/api/upload/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, contentType }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error initiating multipart upload:', error);
    throw error;
  }
};

/**
 * 上传分片
 * @param uploadId 上传ID
 * @param key 文件键
 * @param partNumber 分片序号
 * @param chunk 分片数据 (ArrayBuffer)
 */
export const uploadPart = async (uploadId: string, key: string, partNumber: number, chunk: ArrayBuffer): Promise<{ ETag: string; PartNumber: number }> => {
  try {
    const response = await fetch(`/api/upload/part?uploadId=${encodeURIComponent(uploadId)}&key=${encodeURIComponent(key)}&partNumber=${partNumber}`, {
      method: 'PUT',
      body: chunk,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading part:', error);
    throw error;
  }
};

/**
 * 完成分片上传
 * @param uploadId 上传ID
 * @param key 文件键
 * @param parts 分片列表，包含 ETag 和 PartNumber
 */
export const completeMultipartUpload = async (uploadId: string, key: string, parts: Array<{ ETag: string; PartNumber: number }>): Promise<{ location: string; key: string }> => {
  try {
    const response = await fetch('/api/upload/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uploadId, key, parts }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error completing multipart upload:', error);
    throw error;
  }
};

/**
 * 取消分片上传
 * @param uploadId 上传ID
 * @param key 文件键
 */
export const abortMultipartUpload = async (uploadId: string, key: string): Promise<void> => {
  try {
    const response = await fetch(`/api/upload/abort?uploadId=${encodeURIComponent(uploadId)}&key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error aborting multipart upload:', error);
    throw error;
  }
};