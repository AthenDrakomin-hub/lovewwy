// 类型定义汇总文件
export type { 
  MusicTrack, 
  MusicSearchQuery, 
  MusicPlaylist, 
  MusicPlayerState,
  MusicCollectionItem,
  MusicCollectionState,
  MusicLyrics,
  MusicLyricsLine,
  MusicPlaybackHistory,
  MusicRecommendation
} from './music';

export type { 
  NewsArticle, 
  NewsApiResponse, 
  NewsSearchQuery, 
  NewsSource,
  NewsCategory,
  NewsSourceInfo,
  NewsSourceResponse,
  NewsCollectionItem,
  NewsCollectionState
} from './news';

export type {
  CloudStorageConfig,
  CloudFileOperationResult,
  CloudFileDownload,
  CloudFileMetadata
} from './storage';

// 应用级别的通用类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface NewsItem {
  tag: string;
  headline: string;
  timestamp: string;
  source: string;
  isUrgent?: boolean;
}

export interface SystemStats {
  cpu: number;
  memory: string;
  latency: string;
  uptime: string;
}

export enum NavSection {
  Dashboard = '仪表盘',
  Music = '音乐馆',
  Video = '视频中心',
  News = '全球资讯',
  Settings = '系统设置',
  Storage = '存储管理'
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface FilterParams {
  [key: string]: any;
}