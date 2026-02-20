
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, 
  ListMusic, Repeat, Shuffle, Repeat1, VolumeX, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Song } from '../types';
import { MOCK_SONGS } from '../constants';
import { getPublicUrl } from '../lib/s3';

interface MusicPlayerProps {
  currentSong: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onExpand: () => void;
  onSelectSong: (song: Song) => void;
}

type PlayMode = 'sequence' | 'loop' | 'shuffle';

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  currentSong, 
  isPlaying, 
  onTogglePlay, 
  onNext, 
  onPrev,
  onExpand,
  onSelectSong
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('sequence');
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong, volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
    }
  };

  const togglePlayMode = () => {
    const modes: PlayMode[] = ['sequence', 'loop', 'shuffle'];
    const nextMode = modes[(modes.indexOf(playMode) + 1) % modes.length];
    setPlayMode(nextMode);
  };

  const handleEnded = () => {
    if (playMode === 'loop') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (playMode === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * MOCK_SONGS.length);
      onSelectSong(MOCK_SONGS[randomIndex]);
    } else {
      onNext();
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-20 glass-player z-50 px-4 md:px-8 flex items-center justify-between">
        <audio 
          ref={audioRef} 
          src={getPublicUrl(currentSong.url)} 
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
        
        {/* Song Info & Visualizer */}
        <div className="flex items-center gap-4 w-1/4 min-w-0">
          <div className="relative group cursor-pointer" onClick={onExpand}>
            <img 
              src={currentSong.cover} 
              alt={currentSong.title} 
              className={`w-12 h-12 rounded-md object-cover flex-shrink-0 transition-transform group-hover:scale-105 ${isPlaying ? 'shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}`}
            />
            {isPlaying && (
              <div className="absolute bottom-1 right-1 flex items-end gap-[2px] h-3 px-1 bg-black/40 backdrop-blur-sm rounded-sm">
                {[1, 2, 3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ height: [4, 10, 6, 12, 4] }}
                    transition={{ repeat: Infinity, duration: 0.5 + i * 0.2, ease: "easeInOut" }}
                    className="w-[2px] bg-white opacity-80"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium truncate text-white/90">{currentSong.title}</h4>
            <p className="text-[11px] text-[#8A8FB8] truncate mt-0.5">{currentSong.artist}</p>
          </div>
        </div>

        {/* Central Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-xl px-4">
          <div className="flex items-center gap-8">
            <button 
              onClick={togglePlayMode}
              className="text-[#8A8FB8] hover:text-white transition-colors"
              title={playMode === 'sequence' ? '顺序播放' : playMode === 'loop' ? '单曲循环' : '随机播放'}
            >
              {playMode === 'sequence' && <Repeat size={16} className="opacity-40" />}
              {playMode === 'loop' && <Repeat1 size={16} />}
              {playMode === 'shuffle' && <Shuffle size={16} />}
            </button>

            <div className="flex items-center gap-6">
              <button onClick={onPrev} className="text-[#8A8FB8] hover:text-white transition transform active:scale-90">
                <SkipBack size={20} fill="currentColor" className="opacity-80" />
              </button>
              <button 
                onClick={onTogglePlay} 
                className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 transition shadow-lg shadow-white/5"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>
              <button onClick={onNext} className="text-[#8A8FB8] hover:text-white transition transform active:scale-90">
                <SkipForward size={20} fill="currentColor" className="opacity-80" />
              </button>
            </div>

            <button 
              onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
              className={`text-[#8A8FB8] hover:text-white transition-colors ${isPlaylistOpen ? 'text-white' : ''}`}
            >
              <ListMusic size={18} />
            </button>
          </div>

          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#8A8FB8] w-10 text-right">
              {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
            </span>
            <div className="relative flex-1 group py-2">
              <input 
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-white/80 transition-all"
              />
            </div>
            <span className="text-[10px] font-mono text-[#8A8FB8] w-10">
              {audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}
            </span>
          </div>
        </div>

        {/* Right Utils */}
        <div className="flex items-center justify-end gap-6 w-1/4">
          <div 
            className="relative flex items-center gap-2"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute right-8 bg-[#1A1A1A] border border-white/10 rounded-full px-3 py-1 flex items-center shadow-xl"
                >
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-[#8A8FB8] hover:text-white transition"
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
          
          <button onClick={onExpand} className="text-[#8A8FB8] hover:text-white transition" title="沉浸模式">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Playlist Drawer */}
      <AnimatePresence>
        {isPlaylistOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlaylistOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-20 right-4 w-full max-w-sm bg-[#121212] border border-white/10 rounded-t-2xl z-[60] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium tracking-widest text-white/90">当前播放队列</h3>
                  <p className="text-[10px] text-[#8A8FB8] mt-1">{MOCK_SONGS.length} 首曲目</p>
                </div>
                <button 
                  onClick={() => setIsPlaylistOpen(false)}
                  className="p-1 hover:bg-white/5 rounded-full transition"
                >
                  <X size={18} className="text-[#8A8FB8]" />
                </button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                {MOCK_SONGS.map((song) => (
                  <div 
                    key={song.id}
                    onClick={() => {
                      onSelectSong(song);
                      setIsPlaylistOpen(false);
                    }}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer group ${currentSong.id === song.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                  >
                    <div className="relative w-10 h-10 rounded overflow-hidden">
                      <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                      {currentSong.id === song.id && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs truncate ${currentSong.id === song.id ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                        {song.title}
                      </h4>
                      <p className="text-[10px] text-[#8A8FB8] truncate mt-0.5">{song.artist}</p>
                    </div>
                    <div className="text-[10px] font-mono text-[#8A8FB8]/40">
                      3:45
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default MusicPlayer;
