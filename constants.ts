
import { Song, Comment, Video } from './types';

// 使用S3存储桶中的实际音乐文件
// 文件路径: music/文件名.mp3
// 使用getPublicUrl函数获取完整URL
export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: '爱是你我一个错',
    artist: '未知',
    cover: 'https://picsum.photos/seed/aisini/400/400',
    url: 'music/aisinishiyigecuo.mp3',
    lyrics: [
      '爱是你我一个错',
      '相遇在错误的时刻',
      '心动的感觉如此真实',
      '却注定没有结果'
    ],
    hotComment: '有些相遇，注定是错。'
  },
  {
    id: '2',
    title: '安和桥',
    artist: '宋冬野',
    cover: 'https://picsum.photos/seed/anheqiao/400/400',
    url: 'music/anheqiao.mp3',
    lyrics: [
      '让我再看你一遍',
      '从南到北',
      '像是被五环路蒙住的双眼',
      '请你再讲一遍',
      '关于那天'
    ],
    hotComment: '我知道，那些夏天就像青春一样回不来。'
  },
  {
    id: '3',
    title: '不负众望',
    artist: '未知',
    cover: 'https://picsum.photos/seed/bufu/400/400',
    url: 'music/bufuzhongwang.mp3',
    lyrics: [
      '一路走来跌跌撞撞',
      '不曾放弃心中梦想',
      '那些质疑那些嘲笑',
      '都化作前进的力量'
    ],
    hotComment: '终于，我没有辜负那些期待的目光。'
  },
  {
    id: '4',
    title: '倒带',
    artist: '蔡依林',
    cover: 'https://picsum.photos/seed/daodai/400/400',
    url: 'music/daodai.mp3',
    lyrics: [
      '终于看开爱回不来',
      '而你总是太晚明白',
      '最后才把话说开',
      '哭着求我留下来'
    ],
    hotComment: '过去甜蜜在倒带，只是感觉已经不在。'
  },
  {
    id: '5',
    title: '恶作剧',
    artist: '未知',
    cover: 'https://picsum.photos/seed/ezuo/400/400',
    url: 'music/ezuoju.mp3',
    lyrics: [
      '我们的爱情就像一场恶作剧',
      '开始得突然结束得也离奇',
      '你笑着说这只是个游戏',
      '我却当了真付出了真心'
    ],
    hotComment: '原来我只是你恶作剧的对象。'
  }
];

export const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', content: '我一生荒芜，唯独爱你这件事，像是一场盛大的复苏。', songTitle: '复苏', category: 'Heartbeat', isPrivate: false },
  { id: 'c2', content: '所谓成长，就是强迫你跌跌撞撞地受伤，再踉踉跄跄地坚强。', songTitle: '成长', category: 'Growth', isPrivate: false },
  { id: 'c3', content: '有些错过了，就是一辈子。人间不值得，但你值得。', songTitle: '错过', category: 'Regret', isPrivate: false },
  { id: 'c4', content: '愿你历经千帆，归来仍是少年。', songTitle: '归来', category: 'World', isPrivate: false },
  { id: 'c5', content: '那个夏天，我们都没有说再见，却再也没见过。', songTitle: '盛夏', category: 'Regret', isPrivate: false },
  { id: 'c6', content: '你一定要过得好，不然对不起我的落荒而逃。', songTitle: '逃离', category: 'Regret', isPrivate: false },
  { id: 'c7', content: '私密的记忆，只留给自己。', category: 'Private', isPrivate: true },
];

export const MOCK_VIDEOS: Video[] = [
  { 
    id: 'v1', 
    title: '深夜港口 (Late Night Harbor)', 
    thumbnail: 'https://images.pexels.com/photos/2090641/pexels-photo-2090641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    videoUrl: 'https://joy1.videvo.net/videvo_files/video/free/2019-11/large_watermarked/190828_27_Busan_Night_01_preview.mp4',
    description: '静谧的深夜港口，船只静静停泊，仿佛时间在此刻凝固。'
  },
  { 
    id: 'v2', 
    title: '雨夜城市 (Rainy City Night)', 
    thumbnail: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    videoUrl: 'https://joy1.videvo.net/videvo_files/video/free/2014-12/large_watermarked/Raindrops_Traffic_preview.mp4',
    description: '雨水打湿了城市的霓虹，车流如织，在这个不眠之夜。'
  },
  { 
    id: 'v3', 
    title: '冬日山脉 (Winter Mountains)', 
    thumbnail: 'https://images.pexels.com/photos/66997/pexels-photo-66997.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    videoUrl: 'https://joy1.videvo.net/videvo_files/video/free/2019-03/large_watermarked/190111_08_SnowyMountains_v1_02_preview.mp4',
    description: '白雪皑皑的山巅，唯有风声吹过。'
  },
  { 
    id: 'v4', 
    title: '无尽之路 (Endless Road)', 
    thumbnail: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    videoUrl: 'https://joy1.videvo.net/videvo_files/video/free/2015-08/large_watermarked/Route_66_preview.mp4',
    description: '望不到尽头的公路，是我们每个人都在走的平凡之路。'
  }
];

export const MOCK_PRIVATE_PLAYLISTS = [
  { id: 'p1', name: '凌晨两点的独白', count: 12, category: 'Private' },
  { id: 'p2', name: '那些没寄出的信', count: 8, category: 'Private' },
  { id: 'p3', name: '碎片记忆', count: 24, category: 'Private' },
];

export const MOCK_PRIVATE_COMMENTS: Comment[] = [
  { id: 'pc1', content: '其实，我只是在等一个不可能的可能。', category: 'Private', isPrivate: true, songTitle: '无人知晓' },
  { id: 'pc2', content: '那是我们最后一次在路口告别，从此山高路远，再无交集。', category: 'Private', isPrivate: true, songTitle: '路口' },
  { id: 'pc3', content: '有些人，光是遇见就已经花光了所有运气。', category: 'Private', isPrivate: true, songTitle: '运气' },
];

export const MOCK_PRIVATE_VIDEOS: Video[] = [
  { 
    id: 'pv1', 
    title: '秘密基地 (Secret Base)', 
    thumbnail: 'https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    videoUrl: '#',
    description: '只有我知道的地方，存放着不敢言说的光影。'
  },
];
