
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronRight, ChevronLeft, Music, Loader, Search } from 'lucide-react';
import { Song } from '../types';
import { getLyrics } from '../lib/saavn';
import SaavnSearch from './SaavnSearch';

interface PlayerPageProps {
  song: Song | null;
  isPlaying: boolean;
  onSelectSong: (song: Song) => void;
  onTogglePlay: () => void;
  onNavigateToPlaylist?: (playlist: 'lonely' | 'midnight' | 'private') => void;
}

const PlayerPage: React.FC<PlayerPageProps> = ({ song, isPlaying, onSelectSong, onTogglePlay, onNavigateToPlaylist }) => {
  const [showFullComments, setShowFullComments] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  useEffect(() => {
    if (!song) {
      setLyrics([]);
      return;
    }

    // 如果歌曲已经有歌词，直接使用
    if (song.lyrics && song.lyrics.length > 0) {
      setLyrics(song.lyrics);
      return;
    }

    // 检查是否为Saavn歌曲（根据ID前缀）
    const isSaavnSong = song.id.startsWith('saavn-');
    if (!isSaavnSong) {
      // 非Saavn歌曲，使用空歌词或模拟歌词
      setLyrics(song.lyrics || []);
      return;
    }

    // 从Saavn API获取歌词
    const fetchLyrics = async () => {
      setLyricsLoading(true);
      try {
        const saavnId = song.id.replace('saavn-', '');
        const fetchedLyrics = await getLyrics(saavnId);
        setLyrics(fetchedLyrics);
        
        // 可选：更新歌曲对象的歌词（但注意不要直接修改prop）
        // 在实际应用中，可能需要通过回调更新父组件的状态
      } catch (error) {
        console.error('Failed to fetch lyrics from Saavn:', error);
        setLyrics([]);
      } finally {
        setLyricsLoading(false);
      }
    };

    fetchLyrics();
  }, [song]);

  // 如果显示搜索模式，渲染Saavn搜索组件
  if (showSearch) {
    return (
      <div className="min-h-screen pt-20 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowSearch(false)}
              className="flex items-center gap-2 text-[#8A8FB8] hover:text-white transition"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">返回播放器</span>
            </button>
            <h1 className="text-2xl font-light tracking-widest">Saavn 音乐搜索</h1>
            <div className="w-10"></div> {/* 占位 */}
          </div>
          <SaavnSearch
            onSelectSong={onSelectSong}
            currentSong={song}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
          />
        </div>
      </div>
    );
  }

  // 如果没有歌曲，显示加载状态
  if (!song) {
    return (
      <div className="min-h-screen pt-20 pb-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
            <Music size={48} className="text-white/20" />
          </div>
          <h2 className="text-2xl font-light tracking-widest text-white/60 mb-4">加载中...</h2>
          <p className="text-[#8A8FB8] text-sm">正在从S3获取歌曲列表，请稍候。</p>
        </div>
      </div>
    );
  }

  // 正常播放器界面
  return (
    <div className="min-h-screen pt-20 pb-24 px-4 flex transition-all duration-500 overflow-hidden">
      {/* Sidebar - Song List Placeholder */}
      <div className="hidden lg:block w-[20%] pr-8">
        <h3 className="text-xs font-medium tracking-widest text-[#8A8FB8] uppercase mb-6">我的歌单</h3>
        <ul className="space-y-4 text-sm text-white/60">
          <li className="text-white font-medium border-l-2 border-white pl-4">当前播放</li>
          <li 
            onClick={() => onNavigateToPlaylist?.('lonely')}
            className="hover:text-white cursor-pointer pl-4 transition hover:bg-white/5 hover:pl-6 rounded-r-lg"
          >
            孤独感集
          </li>
          <li 
            onClick={() => onNavigateToPlaylist?.('midnight')}
            className="hover:text-white cursor-pointer pl-4 transition hover:bg-white/5 hover:pl-6 rounded-r-lg"
          >
            午夜电台
          </li>
          <li 
            onClick={() => onNavigateToPlaylist?.('private')}
            className="hover:text-white cursor-pointer pl-4 transition hover:bg-white/5 hover:pl-6 rounded-r-lg"
          >
            私藏珍品
          </li>
          <li 
            onClick={() => setShowSearch(true)}
            className="hover:text-white cursor-pointer pl-4 transition flex items-center gap-2 mt-8 pt-8 border-t border-white/10"
          >
            <Search size={14} />
            <span>搜索 Saavn 音乐</span>
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-500 ${showFullComments ? 'lg:pr-12' : ''}`}>
        <motion.div 
          key={song.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative group"
        >
          <img 
            src={song.cover} 
            alt={song.title}
            className={`w-[260px] h-[260px] md:w-[320px] md:h-[320px] rounded-full object-cover shadow-2xl spinning-cover ${isPlaying ? '' : 'paused'}`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/40 border border-white/20 backdrop-blur-sm" />
          </div>
        </motion.div>

        <div className="mt-12 text-center max-w-xl w-full">
          <h2 className="text-2xl font-semibold mb-2">{song.title}</h2>
          <p className="text-[#8A8FB8] text-sm mb-8">{song.artist}</p>
          
          <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
            {lyricsLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader className="animate-spin text-[#8A8FB8] mb-2" size={20} />
                <p className="text-xs text-[#8A8FB8]">加载歌词中...</p>
              </div>
            ) : lyrics.length > 0 ? (
              lyrics.map((line, i) => (
                <p 
                  key={i} 
                  className={`text-sm transition-all duration-700 ${i === 2 ? 'text-white text-lg font-medium opacity-100' : 'text-white/30'}`}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="text-sm text-white/30 text-center py-8">
                暂无歌词
              </p>
            )}
          </div>
        </div>

        {/* Floating Hot Comment */}
        <div className="mt-12 max-w-md hidden md:block">
          <div className="flex gap-4 items-start bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
            <MessageSquare size={16} className="text-[#8A8FB8] mt-1 shrink-0" />
            <p className="text-xs italic text-[#8A8FB8] leading-relaxed">
              "{song.hotComment}"
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Full Comments Toggle */}
      <div className={`hidden lg:flex flex-col border-l border-white/5 bg-black/20 transition-all duration-500 overflow-hidden ${showFullComments ? 'w-[25%]' : 'w-0'}`}>
        <div className="p-8 min-w-[300px]">
          <h3 className="text-xs font-medium tracking-widest text-[#8A8FB8] uppercase mb-8">热评墙</h3>
          <div className="space-y-8">
            <CommentCard text="有些歌听得懂的时候，其实已经晚了。" author="佚名" />
            <CommentCard text="那是最好的一年，也是最坏的一年。" author="孤独的夜猫子" />
            <CommentCard text="希望能遇到那个让你觉得人间值得的人。" author="时光机" />
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setShowFullComments(!showFullComments)}
        className="fixed right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-full text-[#8A8FB8] hover:text-white transition hidden lg:block"
      >
        {showFullComments ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Mobile Search Button */}
      <button
        onClick={() => setShowSearch(true)}
        className="fixed bottom-24 right-4 lg:hidden p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/20 shadow-2xl z-40 transition-all"
        aria-label="搜索音乐"
      >
        <Search size={24} />
      </button>
    </div>
  );
};

const CommentCard = ({ text, author }: { text: string; author: string }) => (
  <div className="space-y-2 opacity-80 hover:opacity-100 transition">
    <p className="text-xs leading-relaxed font-light">“{text}”</p>
    <div className="text-[10px] text-[#8A8FB8]">— {author}</div>
  </div>
);

export default PlayerPage;
