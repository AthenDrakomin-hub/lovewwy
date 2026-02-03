
import React, { useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { getMediaUrl } from '../services/storageService';

interface VideoModalProps {
  video: MediaItem | null;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
        onClick={onClose}
      ></div>
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[110] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
        aria-label="Close video"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Video Container */}
      <div className="relative z-10 w-full max-w-6xl aspect-video glass rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] border border-indigo-500/30">
        <video 
          ref={videoRef}
          src={getMediaUrl(video.url)}
          className="w-full h-full object-contain bg-black"
          controls
          autoPlay
          poster={video.thumbnail}
        />
        
        {/* Info Overlay (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2 py-0.5 bg-indigo-600 rounded text-[10px] font-bold uppercase tracking-widest text-white">
              {video.category}
            </span>
          </div>
          <h2 className="text-2xl font-cinematic font-bold text-white">{video.title}</h2>
          <p className="text-zinc-400 text-sm">{video.artist}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
