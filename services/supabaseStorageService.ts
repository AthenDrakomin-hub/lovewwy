/**
 * 测试连接并获取存储桶中音乐和视频文件的示例
 * 使用已部署的Supabase Edge Function: list-files
 */

/**
 * 测试连接到Supabase存储
 */
export const testConnection = async () => {
  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL?.replace('/functions/v1/s3-auth', '');
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration in environment variables');
    return {
      success: false,
      error: 'Missing Supabase configuration. Please check your environment variables (URL or ANON_KEY).'
    };
  }

  try {
    // 构建API URL来测试连接
    // 根据Supabase Edge Function的标准格式，URL应该是项目URL+/functions/v1/+函数名
    const apiUrl = `${supabaseUrl}/functions/v1/list-files?bucket=wangyiyun&prefix=&limit=1`;
    
    // 这里需要适当的认证头
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
    });
    
    if (response.ok) {
      return {
        success: true,
        message: 'Successfully connected to Supabase and list-files function!'
      };
    } else {
      return {
        success: false,
        error: `Connection failed with status: ${response.status}`
      };
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * 获取存储桶中的文件列表
 * @param bucket 存储桶名称
 * @param prefix 文件路径前缀，例如 'music/' 或 'videos/'
 */
export const listBucketContents = async (bucket = 'wangyiyun', prefix?: string) => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL?.replace('/functions/v1/s3-auth', '');
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration (URL or ANON_KEY)');
    }
    
    // 构建API URL来获取文件列表
    const params = new URLSearchParams();
    params.set('bucket', bucket);
    if (prefix) params.set('prefix', prefix);
    params.set('limit', '100');
    
    // 使用正确的Edge Function URL
    const apiUrl = `${supabaseUrl}/functions/v1/list-files?${params.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.status}`);
    }
    
    const json = await response.json();
    return json.files || [];
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
};

/**
 * 获取存储桶中的音乐文件列表
 */
export const listMusicFiles = async () => {
  try {
    const files = await listBucketContents('wangyiyun', 'music/');
    
    // 过滤出音乐文件
    const musicFiles = files.filter((file: any) => {
      const lowerPath = (file.name || file.path || '').toLowerCase();
      return lowerPath.endsWith('.mp3') || 
             lowerPath.endsWith('.wav') || 
             lowerPath.endsWith('.flac') ||
             lowerPath.endsWith('.m4a') ||
             lowerPath.endsWith('.aac');
    });
    
    return {
      success: true,
      files: musicFiles,
      count: musicFiles.length
    };
  } catch (error) {
    console.error('Error fetching music files:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      files: [],
      count: 0
    };
  }
};

/**
 * 获取存储桶中的视频文件列表
 */
export const listVideoFiles = async () => {
  try {
    const files = await listBucketContents('wangyiyun', 'videos/');
    
    // 过滤出视频文件
    const videoFiles = files.filter((file: any) => {
      const lowerPath = (file.name || file.path || '').toLowerCase();
      return lowerPath.endsWith('.mp4') || 
             lowerPath.endsWith('.avi') || 
             lowerPath.endsWith('.mov') ||
             lowerPath.endsWith('.wmv') ||
             lowerPath.endsWith('.mkv');
    });
    
    return {
      success: true,
      files: videoFiles,
      count: videoFiles.length
    };
  } catch (error) {
    console.error('Error fetching video files:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      files: [],
      count: 0
    };
  }
};

/**
 * 获取音乐和视频文件的统一接口
 */
export const listAllMediaFiles = async () => {
  const [musicResult, videoResult] = await Promise.all([
    listMusicFiles(),
    listVideoFiles()
  ]);

  return {
    music: musicResult,
    videos: videoResult
  };
};