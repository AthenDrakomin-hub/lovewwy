
export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  url: string;
  lyrics?: string[];
  hotComment?: string;
}

export interface Comment {
  id: string;
  content: string;
  songTitle?: string;
  category: 'Regret' | 'Growth' | 'Heartbeat' | 'World' | 'Private';
  isPrivate: boolean;
  author?: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  description?: string;
}

export type View = 'home' | 'player' | 'wall' | 'video' | 'private' | 'about' | 'island' | 'share' | 'lonely' | 'midnight';

export interface Minion {
  id: number;
  user_id?: string;
  name?: string;
  is_adult: boolean;
  growth_value: number;
  birth_time: string;
  is_breeding: boolean;
  // UI specific transient states
  x: number;
  y: number;
  isEating: boolean;
  isHappy: boolean;
}

export interface IslandState {
  banana_count: number;
  island_level: number;
  max_minions: number;
  total_minions_raised: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
}
