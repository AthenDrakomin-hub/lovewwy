
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

// 视频列表 - 建议在 S3 存储桶中使用目录结构
export const VIDEOS: MediaItem[] = [
  {
    id: 'v1',
    type: 'video',
    title: 'Neon Drift',
    artist: 'WYY Archive',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
    url: 'videos/motion/neon-drift.mp4',
    duration: '03:15',
    category: 'Motion',
    tags: ["Cyberpunk", "Fast", "Night"]
  },
  {
    id: 'v2',
    type: 'video',
    title: 'Digital Serenity',
    artist: 'WYY Archive',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    url: 'videos/ambient/digital-serenity.mp4',
    duration: '05:40',
    category: 'Ambient',
    tags: ["Relax", "Space", "Minimal"]
  }
];

// 音乐列表
export const MUSIC: MediaItem[] = [
  {
    id: 'a1',
    type: 'audio',
    title: 'Cyber Rain',
    artist: 'Aura Beats',
    thumbnail: 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?auto=format&fit=crop&q=80&w=400',
    url: 'music/lofi/cyber-rain.mp3',
    duration: '04:12',
    category: 'Lofi',
    tags: ["Chill", "Rainy", "Focus"]
  },
  {
    id: 'a2',
    type: 'audio',
    title: 'Solar Flare',
    artist: 'Echo',
    thumbnail: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400',
    url: 'music/synthwave/solar-flare.mp3',
    duration: '03:45',
    category: 'Synthwave',
    tags: ["80s", "Retro", "Drive"]
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
