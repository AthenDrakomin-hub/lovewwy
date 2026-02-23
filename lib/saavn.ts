import { Song } from '../types';

const BASE_URL = 'https://saavn.dev/api';

// Types for Saavn API responses (based on typical response structure)
interface SaavnSongResponse {
  id: string;
  name: string;
  primaryArtists?: string;
  image?: { quality: string; url: string }[];
  downloadUrl?: { quality: string; url: string }[];
  mediaUrl?: string;
  lyrics?: string; // LRC format
}

interface SaavnSearchResponse {
  results?: SaavnSongResponse[];
  data?: SaavnSongResponse[];
}

interface SaavnSongDetailsResponse {
  song?: SaavnSongResponse;
  data?: SaavnSongResponse;
}

/**
 * Search songs using Saavn Dev API
 * @param query Search query (e.g., "周杰伦 晴天")
 * @param page Page number (default: 1)
 * @param limit Number of results per page (default: 20)
 * @returns Promise<Song[]> Array of songs mapped to Song interface
 */
export async function searchSongs(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<Song[]> {
  try {
    const url = `${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Saavn API error: ${response.status} ${response.statusText}`);
    }
    
    const data: SaavnSearchResponse = await response.json();
    
    // Extract songs from response (handle different response structures)
    const songsData = data.results || data.data || [];
    
    // Map Saavn song data to Song interface
    return songsData.map((song, index) => mapSaavnSongToSong(song, index));
  } catch (error) {
    console.error('Error searching songs from Saavn:', error);
    return [];
  }
}

/**
 * Get song details by ID
 * @param id Song ID
 * @returns Promise<Song> Song details
 */
export async function getSongDetails(id: string): Promise<Song | null> {
  try {
    const url = `${BASE_URL}/songs/${id}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Saavn API error: ${response.status} ${response.statusText}`);
    }
    
    const data: SaavnSongDetailsResponse = await response.json();
    
    // Extract song from response
    const songData = data.song || data.data;
    
    if (!songData) {
      throw new Error('Song not found in response');
    }
    
    return mapSaavnSongToSong(songData, 0);
  } catch (error) {
    console.error('Error fetching song details from Saavn:', error);
    return null;
  }
}

/**
 * Get lyrics for a song by ID
 * @param id Song ID
 * @returns Promise<string[]> Array of lyric lines
 */
export async function getLyrics(id: string): Promise<string[]> {
  try {
    const url = `${BASE_URL}/songs/${id}/lyrics`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Saavn API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract lyrics (could be LRC format or plain text)
    const lyricsText = data.lyrics || data.data || '';
    
    // Parse LRC format if needed, or split by lines
    return parseLyrics(lyricsText);
  } catch (error) {
    console.error('Error fetching lyrics from Saavn:', error);
    return [];
  }
}

/**
 * Map Saavn song response to Song interface
 */
function mapSaavnSongToSong(saavnSong: SaavnSongResponse, index: number): Song {
  // Get best quality image
  const imageUrl = saavnSong.image?.[0]?.url || 
                   saavnSong.image?.[1]?.url || 
                   `https://picsum.photos/seed/${saavnSong.id}/400/400`;
  
  // Get best quality media URL
  const mediaUrl = saavnSong.downloadUrl?.[0]?.url || 
                   saavnSong.mediaUrl || 
                   saavnSong.downloadUrl?.[1]?.url || 
                   '';
  
  // Hot comment pool (similar to S3 version)
  const hotComments = [
    '有些歌听得懂的时候，其实已经晚了。',
    '那是最好的一年，也是最坏的一年。',
    '希望能遇到那个让你觉得人间值得的人。',
    '以音为渡，静听人间。',
    '收录心动过的旋律，留存看过的光影。',
    '私人收藏，仅此而已。',
    '来自Saavn Dev API的音乐',
    '音乐是心灵的避难所。',
    '每一首歌都有一个故事。',
    '听的是歌，想的是自己。'
  ];
  
  const hotCommentIndex = index % hotComments.length;
  const hotComment = hotComments[hotCommentIndex];
  
  return {
    id: `saavn-${saavnSong.id || index}`,
    title: saavnSong.name || '未知歌曲',
    artist: saavnSong.primaryArtists || '未知艺术家',
    cover: imageUrl,
    url: mediaUrl,
    lyrics: [], // Will be fetched separately if needed
    hotComment
  };
}

/**
 * Parse lyrics text into array of lines
 * Handles LRC format (timestamps) or plain text
 */
function parseLyrics(lyricsText: string): string[] {
  if (!lyricsText || lyricsText.trim() === '') {
    return [];
  }
  
  // If it's LRC format (contains timestamps like [00:00.00]), remove timestamps
  const lines = lyricsText.split('\n');
  const lyricLines: string[] = [];
  
  for (const line of lines) {
    // Remove LRC timestamps (e.g., [00:00.00] text)
    const cleanLine = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim();
    
    // Skip empty lines and lines that only contain timestamps
    if (cleanLine && cleanLine !== '') {
      lyricLines.push(cleanLine);
    }
  }
  
  // If no lines after cleaning, return original lines without timestamps
  if (lyricLines.length === 0) {
    return lines.map(line => line.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim()).filter(line => line);
  }
  
  return lyricLines;
}

/**
 * Get all songs from Saavn API (default search)
 * This function can be used as a drop-in replacement for getAllSongs from s3.ts
 */
export async function getAllSongsFromSaavn(): Promise<Song[]> {
  // Default search query to get popular songs
  return searchSongs('popular', 1, 50);
}