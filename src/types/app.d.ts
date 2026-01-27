/**
 * 应用全局状态管理接口
 * 定义整个应用的状态结构和操作
 */

import { NewsCollectionState } from './news';
import { MusicCollectionState, MusicPlayerState } from './music';
import { CloudStorageUsage } from './storage';

export interface AppState {
  // 新闻相关状态
  news: NewsState;
  
  // 音乐相关状态
  music: MusicState;
  
  // 存储相关状态
  storage: StorageState;
  
  // 用户相关状态
  user: UserState;
  
  // 系统相关状态
  system: SystemState;
  
  // UI相关状态
  ui: UIState;
}

export interface NewsState {
  articles: NewsCollectionState;
  currentArticle: string | null; // 当前查看的文章ID
  searchQuery: string;
  category: string;
  isLoading: boolean;
  error: string | null;
  lastSearchTime: number;
}

export interface MusicState {
  collection: MusicCollectionState;
  player: MusicPlayerState;
  currentPlaylist: string | null; // 当前播放列表ID
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  lastSearchTime: number;
}

export interface StorageState {
  files: CloudFile[];
  usage: CloudStorageUsage;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number;
  settings: CloudStorageSettings;
}

export interface UserState {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  preferences: UserPreferences;
  settings: UserSettings;
}

export interface SystemState {
  version: string;
  online: boolean;
  lastUpdated: number;
  performance: SystemPerformance;
  logs: SystemLog[];
}

export interface UIState {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  sidebarCollapsed: boolean;
  notifications: UINotification[];
  modals: UIModal[];
  loading: boolean;
  error: string | null;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserPreferences {
  // 新闻偏好
  news: {
    defaultCategory: string;
    autoRefresh: boolean;
    refreshInterval: number; // 分钟
    showImages: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  
  // 音乐偏好
  music: {
    autoPlay: boolean;
    volume: number;
    quality: 'auto' | 'high' | 'medium' | 'low';
    showLyrics: boolean;
    crossfade: boolean;
    crossfadeDuration: number;
  };
  
  // 通用偏好
  general: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
    autoSave: boolean;
  };
}

export interface UserSettings {
  // 存储设置
  storage: {
    autoSync: boolean;
    syncInterval: number; // 分钟
    maxCacheSize: number; // MB
    compressFiles: boolean;
  };
  
  // 隐私设置
  privacy: {
    trackHistory: boolean;
    shareData: boolean;
    analytics: boolean;
  };
  
  // 高级设置
  advanced: {
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
  };
}

export interface SystemPerformance {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  network: {
    upload: number; // KB/s
    download: number; // KB/s
    latency: number; // ms
  };
  storage: {
    used: number;
    available: number;
    percentage: number;
  };
}

export interface SystemLog {
  id: string;
  timestamp: number;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  source: string;
  details?: any;
}

export interface UINotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration: number; // 毫秒，0表示永久
  timestamp: number;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

export interface UIModal {
  id: string;
  type: string;
  title: string;
  content: React.ReactNode;
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  closable: boolean;
  backdrop: boolean;
  data?: any;
}

// 状态操作类型
export type AppAction =
  | NewsAction
  | MusicAction
  | StorageAction
  | UserAction
  | SystemAction
  | UIAction;

export type NewsAction =
  | { type: 'NEWS_SET_ARTICLES'; payload: NewsCollectionState }
  | { type: 'NEWS_SET_CURRENT_ARTICLE'; payload: string | null }
  | { type: 'NEWS_SET_SEARCH_QUERY'; payload: string }
  | { type: 'NEWS_SET_CATEGORY'; payload: string }
  | { type: 'NEWS_SET_LOADING'; payload: boolean }
  | { type: 'NEWS_SET_ERROR'; payload: string | null };

export type MusicAction =
  | { type: 'MUSIC_SET_COLLECTION'; payload: MusicCollectionState }
  | { type: 'MUSIC_SET_PLAYER_STATE'; payload: MusicPlayerState }
  | { type: 'MUSIC_SET_CURRENT_PLAYLIST'; payload: string | null }
  | { type: 'MUSIC_SET_SEARCH_QUERY'; payload: string }
  | { type: 'MUSIC_SET_LOADING'; payload: boolean }
  | { type: 'MUSIC_SET_ERROR'; payload: string | null };

export type StorageAction =
  | { type: 'STORAGE_SET_FILES'; payload: CloudFile[] }
  | { type: 'STORAGE_SET_USAGE'; payload: CloudStorageUsage }
  | { type: 'STORAGE_SET_LOADING'; payload: boolean }
  | { type: 'STORAGE_SET_ERROR'; payload: string | null };

export type UserAction =
  | { type: 'USER_SET_AUTHENTICATED'; payload: boolean }
  | { type: 'USER_SET_PROFILE'; payload: UserProfile | null }
  | { type: 'USER_SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'USER_SET_SETTINGS'; payload: UserSettings };

export type SystemAction =
  | { type: 'SYSTEM_SET_ONLINE'; payload: boolean }
  | { type: 'SYSTEM_SET_PERFORMANCE'; payload: SystemPerformance }
  | { type: 'SYSTEM_ADD_LOG'; payload: SystemLog };

export type UIAction =
  | { type: 'UI_SET_THEME'; payload: 'light' | 'dark' | 'auto' }
  | { type: 'UI_SET_LANGUAGE'; payload: string }
  | { type: 'UI_SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'UI_ADD_NOTIFICATION'; payload: UINotification }
  | { type: 'UI_REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UI_ADD_MODAL'; payload: UIModal }
  | { type: 'UI_REMOVE_MODAL'; payload: string }
  | { type: 'UI_SET_LOADING'; payload: boolean }
  | { type: 'UI_SET_ERROR'; payload: string | null };