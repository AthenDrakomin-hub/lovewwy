
import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '../types';
import { getMediaUrl } from '../services/storageService';
import { MUSIC } from '../constants';
import TimerControls from './TimerControls';

interface PlayerProps {
  currentTrack: MediaItem;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onPlayTrack: (track: MediaItem) => void;
  onTimerSet?: (minutes: number) => void;
  onTimerClear?: () => void;
}

const Player: React.FC<PlayerProps> = ({ currentTrack, isPlaying, onPlayPause, onPlayTrack, onTimerSet, onTimerClear }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playMode, setPlayMode] = useState<'repeat' | 'shuffle' | 'single'>('repeat');
  const [sleepTimeout, setSleepTimeout] = useState<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 监听播放状态改变
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]); // 切换歌曲时也触发播放

  // 监听音量变化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 查找当前曲目的索引
  const currentIndex = MUSIC.findIndex(track => track.id === currentTrack.id);

  // 上一首/下一首功能
  const playNext = () => {
    if (playMode === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * MUSIC.length);
      onPlayTrack(MUSIC[randomIndex]);
    } else {
      const nextIndex = (currentIndex + 1) % MUSIC.length;
      onPlayTrack(MUSIC[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (playMode === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * MUSIC.length);
      onPlayTrack(MUSIC[randomIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + MUSIC.length) % MUSIC.length;
      onPlayTrack(MUSIC[prevIndex]);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedPercent = x / rect.width;
      audioRef.current.currentTime = clickedPercent * duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const togglePlayMode = () => {
    setPlayMode(prev => {
      if (prev === 'repeat') return 'single';
      if (prev === 'single') return 'shuffle';
      return 'repeat';
    });
  };

  const handleTimerSet = (minutes: number) => {
    // 清除现有的定时器
    if (sleepTimeout) {
      clearTimeout(sleepTimeout);
    }
    
    // 设置新的定时器
    const timeout = setTimeout(() => {
      onPlayPause(false); // 停止播放
      if (onTimerClear) onTimerClear(); // 清除定时器状态
    }, minutes * 60 * 1000); // 转换为毫秒
    
    setSleepTimeout(timeout);
    if (onTimerSet) onTimerSet(minutes);
  };

  const handleTimerClear = () => {
    if (sleepTimeout) {
      clearTimeout(sleepTimeout);
      setSleepTimeout(null);
    }
    if (onTimerClear) onTimerClear();
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onPlayPause(!isPlaying);
      } else if (e.code === 'ArrowRight') {
        playNext();
      } else if (e.code === 'ArrowLeft') {
        playPrevious();
      } else if (e.code === 'ArrowUp') {
        setVolume(prev => Math.min(1, prev + 0.1));
      } else if (e.code === 'ArrowDown') {
        setVolume(prev => Math.max(0, prev - 0.1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, onPlayPause, playMode]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <audio 
        key={currentTrack.id} // 切换歌曲时重置 audio 元素
        ref={audioRef} 
        src={getMediaUrl(currentTrack.url)} 
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => {
          if (playMode === 'single') {
            onPlayPause(true); // 单曲循环
          } else {
            playNext(); // 自动播放下一首
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto glass rounded-2xl p-4 flex items-center gap-4 shadow-2xl border border-indigo-500/20">
        <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-lg object-cover aura-glow" alt="Playing" />
        
        <div className="flex-1 hidden sm:block overflow-hidden">
          <h4 className="text-sm font-bold text-white truncate">{currentTrack.title}</h4>
          <p className="text-xs text-zinc-500 truncate">{currentTrack.artist}</p>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={playPrevious}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          
          <button 
            onClick={() => onPlayPause(!isPlaying)}
            className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-indigo-500/40"
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          
          <button 
            onClick={playNext}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="m6 18 8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>

        <div className="flex-1 hidden md:flex items-center gap-4">
          <span className="text-[10px] text-zinc-500 font-mono w-10">{formatTime(currentTime)}</span>
          <div 
            className="flex-1 h-1 bg-zinc-800 rounded-full relative group cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono w-10">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400">
          <button 
            onClick={togglePlayMode}
            className="hover:text-white transition-colors"
            title={`Play mode: ${playMode}`}
          >
            {playMode === 'repeat' && (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
            )}
            {playMode === 'single' && (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            )}
            {playMode === 'shuffle' && (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13H14v-5.66l-1.41 1.41-1.42-1.42 3.54-3.54 1.41 1.41-3.53 3.55z"/>
              </svg>
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 accent-indigo-500"
              aria-label="Volume control"
            />
          </div>
          
          <TimerControls 
            onTimerSet={handleTimerSet}
            onTimerClear={handleTimerClear}
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
