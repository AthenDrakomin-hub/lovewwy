import { MediaItem, Milestone, GalleryImage } from './types';

// 首页推荐视频 - 路径调整为存储桶相对路径
export const FEATURED_VIDEO: MediaItem = {
  id: 'v-hero',
  type: 'video',
  title: "WYY's Visual Aura",
  artist: "Personal Collection",
  thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600",
  url: "videos/hero-visual.mp4",
  duration: "0:45",
  category: "Cinematic",
  tags: ["4K", "Atmospheric", "2024"],
  description: "Exploring the intersection of melody and vision at lovewyy.top."
};

// 示例音乐列表（作为动态数据不可用时的后备）
export const MUSIC: MediaItem[] = [
  {
    id: 'sample1',
    type: 'audio',
    title: '示例音乐',
    artist: '示例艺术家',
    thumbnail: 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?auto=format&fit=crop&q=80&w=400',
    url: 'music/sample.mp3',
    duration: '03:30',
    category: '示例',
    tags: ["示例", "测试"]
  }
];

// 示例视频列表（作为动态数据不可用时的后备）
export const VIDEOS: MediaItem[] = [
  {
    id: 'sample2',
    type: 'video',
    title: '示例视频',
    artist: '示例创作者',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
    url: 'videos/sample.mp4',
    duration: '02:15',
    category: '示例',
    tags: ["示例", "测试"]
  }
];

export const ANNIVERSARY_DATE = new Date('2023-10-24T00:00:00');

export const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    title: 'The First Spark',
    date: 'Oct 24, 2023',
    description: 'When our digital souls first aligned in perfect harmony.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800'
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'g1',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
    caption: 'Neon Reflections'
  }
];