
export interface MediaItem {
  id: string;
  type: 'video' | 'audio';
  title: string;
  artist: string;
  thumbnail: string;
  url: string;
  duration: string;
  category: string;
  tags: string[];
  description?: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string; // Emoji 或图标 URL
  description: string;
  category: string;
}

export interface MoodRecommendation {
  vibe: string;
  suggestion: string;
  pairing: {
    music: string;
    visual: string;
  };
}

export interface LoveLetterConfig {
  tone: 'romantic' | 'poetic' | 'funny' | 'short';
  occasion: string;
  recipientName: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
}