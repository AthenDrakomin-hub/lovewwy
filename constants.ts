
import { Song, Comment, Video } from './types';

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: '平凡之路',
    artist: '朴树',
    cover: 'https://picsum.photos/seed/p1/400/400',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    lyrics: [
      '徘徊着的 在路上的',
      '你看过的 前方',
      '蓝天下的 故乡',
      '那是我最后的 倔强',
      '我曾经跨过山和大海',
      '也穿过人山人海',
      '我曾经拥有着一切',
      '转眼都飘散如烟',
      '我曾经失落失望失掉所有方向',
      '直到看见平凡才是唯一的答案'
    ],
    hotComment: '我曾经毁了我的一切，只想永远地离开。我曾经堕入无边黑暗，想挣扎无法自拔。'
  },
  {
    id: '2',
    title: '消愁',
    artist: '毛不易',
    cover: 'https://picsum.photos/seed/m2/400/400',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    lyrics: [
      '当你走进这欢乐场',
      '背上所有的梦与想',
      '各色的脸上各色的妆',
      '没人记得你的模样',
      '一杯敬朝阳 一杯敬月光',
      '唤醒我的向往 温柔了寒窗',
      '一杯敬故乡 一杯敬远方',
      '驱散了迷惘 打碎了夕阳'
    ],
    hotComment: '清醒的人最荒唐。'
  },
  {
    id: '3',
    title: '大鱼',
    artist: '周深',
    cover: 'https://picsum.photos/seed/d3/400/400',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    lyrics: [
      '海浪无声将夜幕深深淹没',
      '漫过天空尽头的角落',
      '大鱼在梦境的缝隙里游过',
      '凝望你沉睡的轮廓',
      '看海天一色 听风起雨落',
      '执子之手 吹散苍茫茫甘霖'
    ],
    hotComment: '怕你飞远去，怕你离我而去，更怕你永远停留在这里。'
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
