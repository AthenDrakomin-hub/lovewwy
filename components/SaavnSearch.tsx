import React, { useState, useEffect } from 'react';
import { Search, Music, Play, Pause, Loader } from 'lucide-react';
import { Song } from '../types';
import { searchSongs, getLyrics } from '../lib/saavn';
import { motion } from 'framer-motion';

interface SaavnSearchProps {
  onSelectSong: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const SaavnSearch: React.FC<SaavnSearchProps> = ({
  onSelectSong,
  currentSong,
  isPlaying,
  onTogglePlay,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState<Record<string, boolean>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const results = await searchSongs(query, 1, 20);
      setSearchResults(results);
      if (results.length === 0) {
        setError('未找到相关歌曲，请尝试其他关键词。');
      }
    } catch (err) {
      console.error('搜索失败:', err);
      setError('搜索失败，请检查网络连接或稍后重试。');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSongClick = async (song: Song) => {
    onSelectSong(song);
    setSelectedSongId(song.id);

    // 如果歌曲没有歌词，尝试获取歌词
    if (!song.lyrics || song.lyrics.length === 0) {
      setLyricsLoading(prev => ({ ...prev, [song.id]: true }));
      try {
        const lyrics = await getLyrics(song.id.replace('saavn-', ''));
        if (lyrics.length > 0) {
          // 更新歌曲的歌词（在实际应用中可能需要更新状态）
          song.lyrics = lyrics;
        }
      } catch (err) {
        console.error('获取歌词失败:', err);
      } finally {
        setLyricsLoading(prev => ({ ...prev, [song.id]: false }));
      }
    }
  };

  const handlePlayPause = (song: Song) => {
    if (currentSong?.id === song.id) {
      onTogglePlay();
    } else {
      onSelectSong(song);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-light tracking-[0.4em] mb-6 uppercase text-center">Saavn 音乐搜索</h1>
          <p className="text-[#8A8FB8] text-sm text-center mb-8 max-w-2xl mx-auto">
            使用 Saavn Dev API 搜索海量音乐，无密钥、无 CORS、东南亚访问极快，支持完整歌曲播放和高音质 MP3 直链。
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8A8FB8]" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索歌曲、歌手或专辑（例如：周杰伦 晴天）"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#8A8FB8] focus:outline-none focus:border-white/30 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '搜索中...' : '搜索'}
              </button>
            </div>
          </form>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-8 text-center"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="animate-spin text-[#8A8FB8] mb-4" size={32} />
            <p className="text-[#8A8FB8]">正在搜索歌曲...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {searchResults.map((song) => {
              const isCurrentSong = currentSong?.id === song.id;
              const isLoadingLyrics = lyricsLoading[song.id];

              return (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden group cursor-pointer transition-all ${isCurrentSong ? 'ring-2 ring-white/30' : ''}`}
                  onClick={() => handleSongClick(song)}
                >
                  <div className="relative">
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPause(song);
                      }}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all transform group-hover:scale-110"
                    >
                      {isCurrentSong && isPlaying ? (
                        <Pause size={20} className="text-white" />
                      ) : (
                        <Play size={20} className="text-white ml-1" />
                      )}
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-medium text-white truncate">{song.title}</h3>
                    <p className="text-[#8A8FB8] text-sm mt-1 truncate">{song.artist}</p>

                    {song.hotComment && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-[#8A8FB8] italic line-clamp-2">"{song.hotComment}"</p>
                      </div>
                    )}

                    {isLoadingLyrics && (
                      <div className="mt-3 flex items-center gap-2">
                        <Loader className="animate-spin text-[#8A8FB8]" size={14} />
                        <span className="text-xs text-[#8A8FB8]">加载歌词中...</span>
                      </div>
                    )}

                    {song.lyrics && song.lyrics.length > 0 && !isLoadingLyrics && (
                      <div className="mt-3">
                        <p className="text-xs text-[#8A8FB8] mb-1">歌词预览:</p>
                        <p className="text-xs text-white/60 line-clamp-2">
                          {song.lyrics.slice(0, 2).join(' ')}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : query && !loading && !error ? (
          <div className="text-center py-20">
            <Music className="mx-auto text-[#8A8FB8] mb-4" size={48} />
            <h3 className="text-xl text-white/60 mb-2">未找到歌曲</h3>
            <p className="text-[#8A8FB8]">尝试使用其他关键词搜索</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="mx-auto text-[#8A8FB8] mb-4" size={48} />
            <h3 className="text-xl text-white/60 mb-2">搜索 Saavn 音乐库</h3>
            <p className="text-[#8A8FB8] max-w-md mx-auto">
              输入歌曲名、歌手或专辑名，探索海量音乐资源。支持中文、英文等多种语言。
            </p>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-[#8A8FB8]">
            使用 Saavn Dev API • 无密钥、无 CORS • 东南亚访问极快 • 高音质 MP3 直链 • 自带 LRC 歌词
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaavnSearch;