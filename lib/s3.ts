import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { Song, Video, Comment } from '../types';

// 简单英文到中文翻译映射
const TRANSLATION_MAP: Record<string, string> = {
  'love': '爱',
  'you': '你',
  'me': '我',
  'hello': '你好',
  'world': '世界',
  'music': '音乐',
  'song': '歌曲',
  'heart': '心',
  'dream': '梦',
  'sky': '天空',
  'star': '星星',
  'moon': '月亮',
  'sun': '太阳',
  'rain': '雨',
  'snow': '雪',
  'wind': '风',
  'sea': '海',
  'river': '河',
  'mountain': '山',
  'flower': '花',
  'tree': '树',
  'bird': '鸟',
  'night': '夜晚',
  'day': '白天',
  'time': '时间',
  'life': '生活',
  'friend': '朋友',
  'home': '家',
  'city': '城市',
  'road': '路',
  'journey': '旅程',
  'hope': '希望',
  'peace': '和平',
  'joy': '快乐',
  'sad': '悲伤',
  'happy': '快乐',
  'alone': '孤独',
  'together': '一起',
  'forever': '永远',
  'never': '从不',
  'always': '总是',
  'maybe': '也许',
  'please': '请',
  'thank': '谢谢',
  'sorry': '对不起',
  'goodbye': '再见',
  'morning': '早晨',
  'evening': '晚上',
  'afternoon': '下午',
  'winter': '冬天',
  'summer': '夏天',
  'spring': '春天',
  'autumn': '秋天',
  'blue': '蓝色',
  'red': '红色',
  'green': '绿色',
  'yellow': '黄色',
  'white': '白色',
  'black': '黑色',
  'one': '一',
  'two': '二',
  'three': '三',
  'four': '四',
  'five': '五',
  'six': '六',
  'seven': '七',
  'eight': '八',
  'nine': '九',
  'ten': '十'
};

// 简单翻译函数：将英文单词翻译成中文
function translateToChinese(text: string): string {
  const words = text.toLowerCase().split(/\s+/);
  const translatedWords = words.map(word => {
    // 移除标点符号
    const cleanWord = word.replace(/[^\w]/g, '');
    return TRANSLATION_MAP[cleanWord] || word;
  });
  return translatedWords.join(' ');
}

// 检查文本是否主要是英文
function isMostlyEnglish(text: string): boolean {
  // 简单检查：如果包含中文字符，则不是英文
  const chineseCharRegex = /[\u4e00-\u9fff]/;
  return !chineseCharRegex.test(text);
}

// 从环境变量获取S3配置
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (import.meta && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return '';
};

const endpoint = getEnv('S3_ENDPOINT') || 'https://zlbemopcgjohrnyyiwvs.storage.supabase.co/storage/v1/s3';
const region = getEnv('S3_REGION') || 'ap-south-1';
const accessKeyId = getEnv('S3_ACCESS_KEY_ID') || 'f38ef481de3083a75df0a4641914962a';
const secretAccessKey = getEnv('S3_SECRET_ACCESS_KEY') || '7d3bbaf345256cb64e9e377457018f8cdc4013aa6ec0d9a6d87e4d2e1003c91c';

// 创建S3客户端配置
export const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Supabase Storage需要path style
});

// 存储桶名称（需要根据实际情况设置）
const BUCKET_NAME = 'wangyiyun'; // 用户提供的存储桶名称

/**
 * 列出存储桶中的文件
 */
export async function listFiles(prefix?: string) {
  try {
    let continuationToken: string | undefined;
    let allFiles: any[] = [];
    
    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000, // 每页最多1000个文件
      });
      const response = await s3Client.send(command);
      
      if (response.Contents) {
        allFiles = allFiles.concat(response.Contents);
      }
      
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    
    return allFiles;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

/**
 * 获取文件的公开URL（如果文件是公开的）
 * 支持S3兼容模式，包括Supabase Storage和其他S3兼容服务
 */
export function getPublicUrl(key: string) {
  try {
    // 如果key已经是完整URL，直接返回
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }
    
    // 检查是否为Supabase Storage端点
    if (endpoint.includes('supabase.co/storage/v1/s3')) {
      // Supabase Storage的公开URL格式
      return `${endpoint.replace('/storage/v1/s3', '')}/storage/v1/object/public/${BUCKET_NAME}/${key}`;
    }
    
    // 标准S3兼容服务URL格式（path style）
    // 格式: https://endpoint/bucket/key
    if (endpoint) {
      const url = new URL(endpoint);
      return `${url.protocol}//${url.host}/${BUCKET_NAME}/${key}`;
    }
    
    // 如果endpoint为空，返回原始key（可能是相对路径）
    return key;
  } catch (error) {
    console.error('Error generating public URL:', error);
    // 出错时返回原始key
    return key;
  }
}

/**
 * 获取文件的预签名URL（用于临时访问私有文件）
 */
export async function getSignedFileUrl(key: string, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

/**
 * 上传文件到存储桶
 */
export async function uploadFile(key: string, file: File | Buffer, contentType?: string) {
  try {
    let body: Buffer | Uint8Array;
    
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      body = new Uint8Array(arrayBuffer);
    } else {
      body = file;
    }
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType || (file instanceof File ? file.type : 'application/octet-stream'),
    });
    
    await s3Client.send(command);
    return getPublicUrl(key);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * 从S3获取所有音乐文件并转换为Song对象数组
 */
export async function getAllSongs(): Promise<Song[]> {
  try {
    const files = await listFiles('music/');
    
    // 过滤出.mp3文件
    const musicFiles = files.filter(file => 
      file.Key && file.Key.toLowerCase().endsWith('.mp3')
    );
    
    // 热评库
    const hotComments = [
      '有些歌听得懂的时候，其实已经晚了。',
      '那是最好的一年，也是最坏的一年。',
      '希望能遇到那个让你觉得人间值得的人。',
      '以音为渡，静听人间。',
      '收录心动过的旋律，留存看过的光影。',
      '私人收藏，仅此而已。',
      '来自S3存储的音乐',
      '音乐是心灵的避难所。',
      '每一首歌都有一个故事。',
      '听的是歌，想的是自己。'
    ];
    
    // 歌词库（每首歌生成3-5行）
    const lyricLines = [
      '风吹过的街道，记忆中的你',
      '时光匆匆，岁月静好',
      '如果有一天，我们再次相遇',
      '在茫茫人海中，寻找你的身影',
      '雨后的天空，格外清澈',
      '心中的旋律，永远不会停止',
      '每一个音符，都是对你的思念',
      '夜晚的星空，照亮前行的路',
      '梦想与现实，交织在一起',
      '珍惜当下，拥抱未来'
    ];
    
    // 将文件转换为Song对象
    const songs: Song[] = musicFiles.map((file, index) => {
      const fileName = file.Key?.replace('music/', '').replace('.mp3', '') || `song-${index}`;
      const fileKey = file.Key?.replace('music/', '') || `song-${index}.mp3`;
      
      // 尝试从localStorage获取中文标题
      let title = '';
      let artist = '未知';
      let useCustomTitle = false;
      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const titleMap = JSON.parse(localStorage.getItem('songTitleMap') || '{}');
          const fileBaseName = fileKey.toLowerCase().replace(/[^a-z0-9.]/g, '-');
          const customTitle = titleMap[fileBaseName];
          
          if (customTitle && customTitle.title && customTitle.title.trim() !== '') {
            title = customTitle.title.trim();
            artist = customTitle.artist && customTitle.artist.trim() !== '' ? customTitle.artist.trim() : '未知';
            useCustomTitle = true;
            console.log(`使用自定义标题: ${fileBaseName} -> ${title}`);
          }
        }
      } catch (error) {
        console.error('读取localStorage失败:', error);
      }
      
      // 如果没有自定义标题，使用文件名生成标题
      if (!useCustomTitle) {
        title = fileName
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());
        
        // 自动翻译：如果标题主要是英文，尝试翻译成中文
        if (isMostlyEnglish(title)) {
          const translatedTitle = translateToChinese(title);
          // 如果翻译结果与原文不同，使用翻译后的标题
          if (translatedTitle !== title.toLowerCase()) {
            title = translatedTitle;
            console.log(`已翻译歌名: ${fileName} -> ${title}`);
          }
        }
      }
      
      // 生成封面图片URL（使用picsum.photos，基于文件名生成种子）
      const coverSeed = fileName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const coverUrl = `https://picsum.photos/seed/${coverSeed}/400/400`;
      
      // 随机选择热评
      const hotCommentIndex = index % hotComments.length;
      const hotComment = hotComments[hotCommentIndex];
      
      // 生成随机歌词（3-5行）
      const lyricCount = 3 + (index % 3); // 3, 4, 5行
      const lyrics: string[] = [];
      for (let i = 0; i < lyricCount; i++) {
        const lineIndex = (index + i) % lyricLines.length;
        lyrics.push(lyricLines[lineIndex]);
      }
      
      return {
        id: `s3-${index + 1}`,
        title: title,
        artist: artist,
        cover: coverUrl,
        url: file.Key || `music/${fileName}.mp3`,
        lyrics: lyrics,
        hotComment: hotComment
      };
    });
    
    console.log(`从S3获取了 ${songs.length} 首歌曲`);
    return songs;
  } catch (error) {
    console.error('Error fetching songs from S3:', error);
    // 出错时返回空数组
    return [];
  }
}

/**
 * 从S3获取所有视频文件并转换为Video对象数组
 */
export async function getAllVideos(): Promise<Video[]> {
  try {
    const files = await listFiles('videos/');
    
    // 过滤出视频文件
    const videoFiles = files.filter(file => {
      if (!file.Key) return false;
      const key = file.Key.toLowerCase();
      return key.endsWith('.mp4') || key.endsWith('.webm') || key.endsWith('.mov') || 
             key.endsWith('.avi') || key.endsWith('.mkv');
    });
    
    // 视频描述库
    const videoDescriptions = [
      '静谧的深夜港口，船只静静停泊，仿佛时间在此刻凝固。',
      '雨水打湿了城市的霓虹，车流如织，在这个不眠之夜。',
      '白雪皑皑的山巅，唯有风声吹过。',
      '望不到尽头的公路，是我们每个人都在走的平凡之路。',
      '收录看过的光影，留存此刻的静谧。',
      '以音为渡，静听人间。',
      '每一个画面，都有一个故事。',
      '时光匆匆，岁月静好。',
      '在茫茫人海中，寻找你的身影。',
      '雨后的天空，格外清澈。'
    ];
    
    // 将文件转换为Video对象
    const videos: Video[] = videoFiles.map((file, index) => {
      const fileName = file.Key?.replace('videos/', '').split('.')[0] || `video-${index}`;
      
      // 从文件名生成标题（简单处理：将下划线或连字符替换为空格）
      let title = fileName
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
      
      // 自动翻译：如果标题主要是英文，尝试翻译成中文
      if (isMostlyEnglish(title)) {
        const translatedTitle = translateToChinese(title);
        // 如果翻译结果与原文不同，使用翻译后的标题
        if (translatedTitle !== title.toLowerCase()) {
          title = translatedTitle;
          console.log(`已翻译视频标题: ${fileName} -> ${title}`);
        }
      }
      
      // 生成缩略图URL（使用picsum.photos，基于文件名生成种子）
      const thumbnailSeed = fileName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const thumbnailUrl = `https://picsum.photos/seed/${thumbnailSeed}/800/450`;
      
      // 获取视频URL
      const videoUrl = getPublicUrl(file.Key || `videos/${fileName}.mp4`);
      
      // 随机选择描述
      const descriptionIndex = index % videoDescriptions.length;
      const description = videoDescriptions[descriptionIndex];
      
      return {
        id: `video-${index + 1}`,
        title: title,
        thumbnail: thumbnailUrl,
        videoUrl: videoUrl,
        description: description
      };
    });
    
    console.log(`从S3获取了 ${videos.length} 个视频`);
    return videos;
  } catch (error) {
    console.error('Error fetching videos from S3:', error);
    // 出错时返回空数组
    return [];
  }
}

/**
 * 读取S3对象的内容
 */
async function getObjectContent(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(command);
    const content = await response.Body?.transformToString();
    return content || '';
  } catch (error) {
    console.error(`Error reading object ${key}:`, error);
    return '';
  }
}

/**
 * 从S3获取所有评论文件并转换为Comment对象数组
 * 评论文件存储在reping/目录中，格式为JSON
 */
export async function getAllComments(): Promise<Comment[]> {
  try {
    const files = await listFiles('reping/');
    
    // 过滤出.json文件
    const jsonFiles = files.filter(file => 
      file.Key && file.Key.toLowerCase().endsWith('.json')
    );
    
    // 读取并解析每个JSON文件
    const comments: Comment[] = [];
    for (const file of jsonFiles) {
      if (!file.Key) continue;
      
      try {
        const content = await getObjectContent(file.Key);
        if (!content) continue;
        
        const commentData = JSON.parse(content);
        
        // 验证必需字段
        if (!commentData.id || !commentData.content || !commentData.category) {
          console.warn(`Invalid comment format in file ${file.Key}: missing required fields`);
          continue;
        }
        
        // 确保category是有效的类型
        const validCategories = ['Regret', 'Growth', 'Heartbeat', 'World', 'Private'];
        const category = validCategories.includes(commentData.category) 
          ? commentData.category as 'Regret' | 'Growth' | 'Heartbeat' | 'World' | 'Private'
          : 'World';
        
        comments.push({
          id: commentData.id,
          content: commentData.content,
          songTitle: commentData.songTitle || '',
          category: category,
          isPrivate: Boolean(commentData.isPrivate),
          author: commentData.author || ''
        });
      } catch (error) {
        console.error(`Error parsing comment file ${file.Key}:`, error);
      }
    }
    
    console.log(`从S3获取了 ${comments.length} 条评论`);
    return comments;
  } catch (error) {
    console.error('Error fetching comments from S3:', error);
    // 出错时返回空数组
    return [];
  }
}

/**
 * 检查S3连接是否正常
 */
export async function testS3Connection() {
  try {
    const files = await listFiles();
    console.log('S3 connection successful. Found files:', files.length);
    return { success: true, fileCount: files.length };
  } catch (error) {
    console.error('S3 connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}