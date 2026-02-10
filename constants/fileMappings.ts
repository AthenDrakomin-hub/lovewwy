/**
 * 文件名到中文标题的映射
 * 用于将S3存储中的英文/拼音文件名转换为中文显示
 */

export interface FileMapping {
  originalName: string;  // 原始文件名（不带扩展名）
  chineseTitle: string;  // 中文标题
  artist: string;       // 艺术家/作者
  category: string;     // 分类
  tags: string[];       // 标签
  description?: string; // 描述
}

// 音乐文件映射
export const MUSIC_MAPPINGS: FileMapping[] = [
  // 从测试结果中看到的音乐文件
  { originalName: 'aisinishiyigecuo', chineseTitle: '爱死你是一个错', artist: '未知艺术家', category: '流行', tags: ['情感', '悲伤'] },
  { originalName: 'anheqiao', chineseTitle: '安河桥', artist: '宋冬野', category: '民谣', tags: ['民谣', '回忆'] },
  { originalName: 'bufuzhongwang', chineseTitle: '不负众望', artist: '未知艺术家', category: '流行', tags: ['励志', '正能量'] },
  { originalName: 'daodai', chineseTitle: '倒带', artist: '蔡依林', category: '流行', tags: ['回忆', '情感'] },
  { originalName: 'ezuoju', chineseTitle: '恶作剧', artist: '未知艺术家', category: '流行', tags: ['轻松', '甜蜜'] },
  { originalName: 'guohuo', chineseTitle: '过火', artist: '张信哲', category: '流行', tags: ['情感', '经典'] },
  { originalName: 'jishiben', chineseTitle: '记事本', artist: '陈慧琳', category: '流行', tags: ['回忆', '情感'] },
  { originalName: 'nanhai', chineseTitle: '男孩', artist: '梁博', category: '摇滚', tags: ['摇滚', '激情'] },
  { originalName: 'nibuzhidaodeshi', chineseTitle: '你不知道的事', artist: '王力宏', category: '流行', tags: ['情感', '浪漫'] },
  { originalName: 'nishuowomenxiangjianhenwan', chineseTitle: '你说我们相见恨晚', artist: '彭佳慧', category: '流行', tags: ['情感', '遗憾'] },
  { originalName: 'putaochengshushi', chineseTitle: '葡萄成熟时', artist: '陈奕迅', category: '流行', tags: ['经典', '哲理'] },
  { originalName: 'qishi', chineseTitle: '其实', artist: '薛之谦', category: '流行', tags: ['情感', '深情'] },
  { originalName: 'ruguodeshi', chineseTitle: '如果的事', artist: '范玮琪', category: '流行', tags: ['友情', '温暖'] },
  { originalName: 'taohuajie', chineseTitle: '桃花结', artist: '未知艺术家', category: '古风', tags: ['古风', '中国风'] },
  { originalName: 'wobushichenpingandabuliaobaiwanquan', chineseTitle: '我不是陈平安大不了白万全', artist: '未知艺术家', category: '流行', tags: ['现代', '个性'] },
  { originalName: 'xiayigetianiang', chineseTitle: '下一个天亮', artist: '郭静', category: '流行', tags: ['清新', '希望'] },
  { originalName: 'xuanzeshiyi', chineseTitle: '选择失忆', artist: '季彦霖', category: '流行', tags: ['情感', '悲伤'] },
  { originalName: 'yuyegangqing', chineseTitle: '雨夜钢琴', artist: '林志美', category: '经典', tags: ['经典', '怀旧'] },
  { originalName: 'zuichangdedianying', chineseTitle: '最长的电影', artist: '周杰伦', category: '流行', tags: ['经典', '情感'] },
  { originalName: 'zuihaodeanpai', chineseTitle: '最好的安排', artist: '曲婉婷', category: '流行', tags: ['励志', '正能量'] },
  { originalName: 'zuowei', chineseTitle: '作为', artist: '未知艺术家', category: '流行', tags: ['现代', '思考'] },
];

// 视频文件映射
export const VIDEO_MAPPINGS: FileMapping[] = [
  { originalName: 'IMG_4116', chineseTitle: '回忆片段', artist: '个人收藏', category: '生活', tags: ['回忆', '日常'] },
];

/**
 * 根据文件名获取映射信息
 * @param filename 文件名（可以带扩展名）
 * @param fileType 文件类型：'music' 或 'video'
 * @returns 映射信息或默认值
 */
export function getFileMapping(filename: string, fileType: 'music' | 'video' = 'music'): FileMapping {
  // 去除扩展名和路径
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '').split('/').pop() || filename;
  
  const mappings = fileType === 'music' ? MUSIC_MAPPINGS : VIDEO_MAPPINGS;
  const mapping = mappings.find(m => m.originalName === nameWithoutExt);
  
  if (mapping) {
    return mapping;
  }
  
  // 默认映射
  return {
    originalName: nameWithoutExt,
    chineseTitle: nameWithoutExt, // 如果没有映射，使用原文件名
    artist: fileType === 'music' ? '未知艺术家' : '个人收藏',
    category: fileType === 'music' ? '音乐' : '视频',
    tags: fileType === 'music' ? ['音乐'] : ['视频'],
  };
}

/**
 * 根据路径判断文件类型
 * @param path 文件路径
 * @returns 文件类型：'music'、'video' 或 'other'
 */
export function getFileTypeFromPath(path: string): 'music' | 'video' | 'other' {
  if (path.startsWith('music/') || path.endsWith('.mp3') || path.endsWith('.wav') || path.endsWith('.flac')) {
    return 'music';
  }
  if (path.startsWith('video/') || path.endsWith('.mp4') || path.endsWith('.avi') || path.endsWith('.mov')) {
    return 'video';
  }
  return 'other';
}

/**
 * 将S3文件对象转换为媒体项
 * @param file S3文件对象
 * @returns 媒体项
 */
export function convertS3FileToMediaItem(file: any) {
  const fileType = getFileTypeFromPath(file.key);
  const mapping = getFileMapping(file.key, fileType);
  
  // 生成唯一ID
  const id = `dynamic_${fileType}_${file.key.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  return {
    id,
    type: fileType === 'music' ? 'audio' : 'video',
    title: mapping.chineseTitle,
    artist: mapping.artist,
    thumbnail: getDefaultThumbnail(fileType, mapping.category),
    url: file.key,
    duration: formatDuration(file.lastModified), // 可以用文件大小或其他信息模拟时长
    category: mapping.category,
    tags: mapping.tags,
    description: mapping.description || `${mapping.chineseTitle} - ${mapping.artist}`,
    size: file.size,
    lastModified: file.lastModified,
  };
}

/**
 * 获取默认缩略图
 */
function getDefaultThumbnail(fileType: 'music' | 'video' | 'other', category: string): string {
  const musicThumbs = [
    'https://images.unsplash.com/photo-1514525253361-bee8718a300a?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w-400',
  ];
  
  const videoThumbs = [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600',
  ];
  
  if (fileType === 'music') {
    // 根据分类返回不同的缩略图
    if (category.includes('古风') || category.includes('中国风')) {
      return 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&q=80&w=400';
    }
    if (category.includes('摇滚')) {
      return 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400';
    }
    return musicThumbs[Math.floor(Math.random() * musicThumbs.length)];
  }
  
  if (fileType === 'video') {
    return videoThumbs[Math.floor(Math.random() * videoThumbs.length)];
  }
  
  return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600';
}

/**
 * 格式化持续时间（模拟）
 */
function formatDuration(lastModified: string): string {
  // 用最后修改日期生成一个随机的持续时间
  const date = new Date(lastModified);
  const minutes = (date.getMinutes() % 5) + 1; // 1-5分钟
  const seconds = date.getSeconds() % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}