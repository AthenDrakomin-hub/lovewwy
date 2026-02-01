
import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '../types';
import { getMediaUrl } from '../services/storageService';

interface PlayerProps {
  currentTrack: MediaItem;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
}

const Player: React.FC<PlayerProps> = ({ currentTrack, isPlaying, onPlayPause }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <audio 
        key={currentTrack.id} // 切换歌曲时重置 audio 元素
        ref={audioRef} 
        src={getMediaUrl(currentTrack.url)} 
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => onPlayPause(false)}
      />
      
      <div className="max-w-7xl mx-auto glass rounded-2xl p-4 flex items-center gap-4 shadow-2xl border border-indigo-500/20">
        <img src={currentTrack.thumbnail} className="w-12 h-12 rounded-lg object-cover aura-glow" alt="Playing" />
        
        <div className="flex-1 hidden sm:block overflow-hidden">
          <h4 className="text-sm font-bold text-white truncate">{currentTrack.title}</h4>
          <p className="text-xs text-zinc-500 truncate">{currentTrack.artist}</p>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="text-zinc-400 hover:text-white transition-colors">
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
          
          <button className="text-zinc-400 hover:text-white transition-colors">
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
          <button className="hover:text-white transition-colors hidden lg:block">
             <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
