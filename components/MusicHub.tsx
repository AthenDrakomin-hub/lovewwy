
import React, { useState, useMemo } from 'react';
import { MUSIC } from '../constants';
import { MediaItem } from '../types';

interface MusicHubProps {
  onPlayTrack: (track: MediaItem) => void;
  currentTrackId?: string;
  isPlaying?: boolean;
  translations: any;
}

const MusicHub: React.FC<MusicHubProps> = ({ onPlayTrack, currentTrackId, isPlaying, translations }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(MUSIC.map(m => m.category))];
    return cats;
  }, []);

  const filteredMusic = useMemo(() => {
    if (activeCategory === 'All') return MUSIC;
    return MUSIC.filter(m => m.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="py-24 px-8 md:px-16 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
             <span className="text-indigo-400 font-black text-[10px] tracking-[0.4em] uppercase">Library</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-cinematic font-black mb-4">{translations.title}</h2>
          <p className="text-zinc-500 text-lg font-light leading-relaxed">{translations.desc}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 p-1 glass rounded-2xl border-zinc-800">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                activeCategory === cat 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' 
                : 'text-zinc-500 hover:text-white'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {filteredMusic.map((track) => (
          <div 
            key={track.id} 
            className={`group cursor-pointer p-6 rounded-[40px] transition-all duration-500 border-2 ${
              currentTrackId === track.id 
              ? 'bg-indigo-600/10 border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.1)]' 
              : 'bg-zinc-900/20 border-transparent hover:bg-zinc-900/50 hover:border-zinc-800'
            }`}
            onClick={() => onPlayTrack(track)}
          >
            <div className="relative aspect-square mb-6 overflow-hidden rounded-[32px] shadow-2xl">
              <img 
                src={track.thumbnail} 
                className={`w-full h-full object-cover transition-transform duration-1000 ${currentTrackId === track.id && isPlaying ? 'scale-110' : 'group-hover:scale-110'}`}
                alt={track.title}
              />
              <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500 ${currentTrackId === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110 active:scale-90">
                  {currentTrackId === track.id && isPlaying ? (
                    <div className="flex gap-1.5 items-end h-6">
                      <div className="w-1.5 h-3 bg-black animate-bounce-custom"></div>
                      <div className="w-1.5 h-5 bg-black animate-bounce-custom [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-4 bg-black animate-bounce-custom [animation-delay:0.4s]"></div>
                    </div>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-6 h-6 ml-1" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-2">
              <h3 className={`text-lg font-black truncate mb-1 transition-colors ${currentTrackId === track.id ? 'text-indigo-400' : 'text-white'}`}>
                {track.title}
              </h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4 opacity-60">
                {track.artist}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {track.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[9px] px-2.5 py-1 bg-zinc-950/50 text-zinc-500 rounded-lg border border-zinc-800 group-hover:border-indigo-500/20 group-hover:text-indigo-500/60 transition-colors">
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes bounce-custom {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
        .animate-bounce-custom {
          animation: bounce-custom 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MusicHub;
