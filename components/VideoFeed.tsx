import React, { useState, useMemo, useEffect } from 'react';
import { VIDEOS } from '../constants';
import { MediaItem } from '../types';
import { getVideoMediaItems } from '../services/storageService';

interface VideoFeedProps {
  onPlayVideo: (video: MediaItem) => void;
  translations: any;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ onPlayVideo, translations }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [videoData, setVideoData] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载视频数据
  useEffect(() => {
    const loadVideoData = async () => {
      setIsLoading(true);
      try {
        const dynamicVideos = await getVideoMediaItems();
        if (dynamicVideos.length > 0) {
          setVideoData(dynamicVideos);
        } else {
          // 如果动态数据为空，使用硬编码数据
          setVideoData(VIDEOS);
        }
      } catch (error) {
        console.error('Error loading video data:', error);
        // 出错时使用硬编码数据
        setVideoData(VIDEOS);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVideoData();
  }, []);

  const categories = useMemo(() => {
    if (videoData.length === 0) return ['All'];
    const cats = ['All', ...new Set(videoData.map(v => v.category))];
    return cats;
  }, [videoData]);

  const filteredVideos = useMemo(() => {
    if (videoData.length === 0) return [];
    if (activeCategory === 'All') return videoData;
    return videoData.filter(v => v.category === activeCategory);
  }, [activeCategory, videoData]);

  if (isLoading) {
    return (
      <div className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-cinematic font-bold">{translations.title}</h2>
            <p className="text-zinc-500 mt-2">{translations.desc}</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-zinc-500">加载视频数据中...</div>
        </div>
      </div>
    );
  }
  
  if (videoData.length === 0) {
    return (
      <div className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-cinematic font-bold">{translations.title}</h2>
            <p className="text-zinc-500 mt-2">{translations.desc}</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-zinc-500">暂无视频数据</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-cinematic font-bold">{translations.title}</h2>
          <p className="text-zinc-500 mt-2">{translations.desc}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all border ${
                activeCategory === cat 
                ? 'bg-white text-black border-white shadow-lg' 
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVideos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => onPlayVideo(video)}
            aria-label={`Play ${video.title}`}
            className="text-left glass rounded-[32px] overflow-hidden group hover:border-indigo-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
          >
            <div className="relative aspect-video">
              <img 
                src={video.thumbnail} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt={video.title}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white transform scale-90 group-hover:scale-100 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 ml-1" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono border border-white/10">
                {video.duration}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[9px] font-bold uppercase tracking-wider">
                  {video.category}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-400 transition-colors">{video.title}</h3>
              <p className="text-zinc-500 text-sm mb-4">{video.artist}</p>
              
              <div className="mt-auto pt-4 flex flex-wrap gap-2 border-t border-zinc-800/50">
                {video.tags.map(tag => (
                  <span key={tag} className="text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VideoFeed;