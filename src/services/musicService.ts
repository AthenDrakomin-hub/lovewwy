/**
 * 音乐服务
 * 提供音乐搜索、播放、收藏等相关功能
 */

import type { 
  MusicTrack, 
  MusicSearchQuery, 
  MusicSearchResponse, 
  MusicPlaylist, 
  MusicCollectionState,
  MusicPlayerState 
} from '@/types/music';

class MusicService {
  private readonly API_BASE_URL = 'https://api.bzqll.com/music/tencent'; // 示例API地址
  private collectionState: MusicCollectionState = {
    items: [],
    playlists: [],
    total: 0,
    lastUpdated: new Date().toISOString(),
  };

  /**
   * 搜索音乐
   */
  async searchMusic(query: MusicSearchQuery): Promise<MusicTrack[]> {
    try {
      // 构建查询参数字符串
      let queryString = `?name=${encodeURIComponent(query.name)}`;
      if (query.artist) queryString += `&artist=${encodeURIComponent(query.artist)}`;
      if (query.album) queryString += `&album=${encodeURIComponent(query.album)}`;
      if (query.platform) queryString += `&platform=${query.platform}`;
      if (query.limit) queryString += `&limit=${query.limit}`;
      if (query.offset) queryString += `&offset=${query.offset}`;
      
      const response = await fetch(`${this.API_BASE_URL}/search${queryString}`);
      const data: any = await response.json(); // 使用 any 类型以处理实际API响应

      // 检查响应是否成功
      if (response.ok && data.code === 200) {
        // 假设实际API响应包含一个 tracks 或 songs 数组
        const tracksData = data.tracks || data.songs || [];
        
        return tracksData.map((item: any) => ({
          id: item.id || Date.now().toString(),
          name: item.name || item.title || '未知歌曲',
          artist: item.artist || item.singer || '未知艺术家',
          album: item.album || item.albumName || '未知专辑',
          duration: item.duration || 0,
          url: item.url || item.music_url || '',
          coverUrl: item.coverUrl || item.cover_img || item.imgurl,
          lyricsUrl: item.lyricsUrl || item.lyrics_url,
          bitrate: item.bitrate,
          format: item.format,
          size: item.size,
          platform: item.platform || query.platform || 'wy',
          platformName: item.platformName || item.platform || '网易云音乐',
        }));
      }

      return [];
    } catch (error) {
      console.error('搜索音乐失败:', error);
      return [];
    }
  }

  /**
   * 获取推荐音乐
   */
  async getRecommendations(): Promise<MusicTrack[]> {
    // 实现推荐逻辑
    return [];
  }

  /**
   * 创建播放列表
   */
  async createPlaylist(name: string, description: string): Promise<MusicPlaylist> {
    const playlist: MusicPlaylist = {
      id: `playlist_${Date.now()}`,
      name,
      description,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      playCount: 0,
    };

    this.collectionState.playlists.push(playlist);
    this.updateLastUpdated();

    return playlist;
  }

  /**
   * 添加音乐到收藏
   */
  async addToCollection(track: MusicTrack): Promise<void> {
    const existingItem = this.collectionState.items.find(
      item => item.track.url === track.url
    );

    if (!existingItem) {
      const collectionItem = {
        id: `collection_${Date.now()}`,
        track,
        addedAt: new Date().toISOString(),
        tags: [],
        isFavorite: true,
        playCount: 0,
      };

      this.collectionState.items.push(collectionItem);
      this.collectionState.total += 1;
      this.updateLastUpdated();
    }
  }

  /**
   * 从收藏中移除音乐
   */
  async removeFromCollection(trackId: string): Promise<void> {
    this.collectionState.items = this.collectionState.items.filter(
      item => item.track.id !== trackId
    );
    this.collectionState.total = this.collectionState.items.length;
    this.updateLastUpdated();
  }

  /**
   * 获取收藏列表
   */
  getCollection(): MusicCollectionState {
    return { ...this.collectionState };
  }

  /**
   * 获取播放器状态
   */
  getPlayerState(): MusicPlayerState {
    return {
      currentTrack: null,
      isPlaying: false,
      volume: 0.8,
      currentTime: 0,
      duration: 0,
      playbackRate: 1,
      isMuted: false,
      repeatMode: 'off',
      shuffle: false,
    };
  }

  /**
   * 更新最后更新时间
   */
  private updateLastUpdated(): void {
    this.collectionState.lastUpdated = new Date().toISOString();
  }
}

// 创建单例实例
export const musicService = new MusicService();

export default MusicService;