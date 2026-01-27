/**
 * 音乐API响应数据结构
 * 基于无名API的音乐搜索响应格式定义
 */

export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number; // 持续时间（秒）
  url: string; // 音乐文件URL
  coverUrl?: string; // 封面图片URL
  lyricsUrl?: string; // 歌词文件URL
  bitrate?: number; // 比特率
  format?: string; // 音频格式
  size?: number; // 文件大小（字节）
  platform: 'wy' | 'qq' | 'kg' | 'kw'; // 平台标识
  platformName: string; // 平台名称
}

export interface MusicSearchResponse {
  code: number;
  msg: string;
  name: string;
  album: string;
  artist: string;
  music_url: string;
  cover_url?: string;
  lyrics_url?: string;
  duration?: number;
  bitrate?: number;
  format?: string;
  size?: number;
}

export interface MusicSearchQuery {
  name: string; // 歌曲名
  artist?: string; // 歌手
  album?: string; // 专辑
  platform?: 'wy' | 'qq' | 'kg' | 'kw'; // 平台
  limit?: number; // 限制返回数量
  offset?: number; // 偏移量
}

export interface MusicPlaylist {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  tracks: MusicTrack[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  playCount: number;
}

export interface MusicPlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number; // 0-1
  currentTime: number; // 当前播放时间（秒）
  duration: number; // 总时长（秒）
  playbackRate: number; // 播放速度
  isMuted: boolean;
  repeatMode: 'off' | 'track' | 'playlist'; // 循环模式
  shuffle: boolean; // 随机播放
}

export interface MusicCollectionItem {
  id: string;
  track: MusicTrack;
  addedAt: string;
  tags: string[];
  isFavorite: boolean;
  playCount: number;
  lastPlayedAt?: string;
}

export interface MusicCollectionState {
  items: MusicCollectionItem[];
  playlists: MusicPlaylist[];
  total: number;
  lastUpdated: string;
}

export interface MusicLyrics {
  id: string;
  trackId: string;
  lyrics: string;
  translatedLyrics?: string;
  timeSynced: boolean; // 是否时间同步歌词
  lines: MusicLyricsLine[];
}

export interface MusicLyricsLine {
  time: number; // 时间戳（毫秒）
  text: string;
  translatedText?: string;
}

export interface MusicPlaybackHistory {
  id: string;
  track: MusicTrack;
  playedAt: string;
  durationPlayed: number; // 实际播放时长（秒）
  isCompleted: boolean; // 是否完整播放
}

export interface MusicRecommendation {
  id: string;
  track: MusicTrack;
  score: number; // 推荐分数
  reason: string; // 推荐理由
  source: 'history' | 'similar' | 'trending' | 'editorial'; // 推荐来源
}