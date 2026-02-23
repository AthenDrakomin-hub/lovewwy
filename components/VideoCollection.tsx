
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { getAllVideos } from '../lib/s3';
import { Video } from '../types';

const VideoCollection: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 从S3获取视频文件
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const fetchedVideos = await getAllVideos();
        setVideos(fetchedVideos);
      } catch (error) {
        console.error('Failed to fetch videos from S3:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const toggleNativeFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for escape or native fullscreen change
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

      return (
        <div className="min-h-screen pt-24 pb-32 px-4 md:px-12 max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-light tracking-widest mb-4 text-[#F0F0F0]">影像集</h2>
            <p className="text-[#8A8FB8] text-sm tracking-widest font-light">
              收录看过的光影，留存此刻的静谧。
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={32} className="text-[#8A8FB8] animate-spin" />
                <p className="text-[#8A8FB8] text-sm tracking-widest">正在加载视频...</p>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Play size={32} className="text-[#8A8FB8]" />
              </div>
              <h3 className="text-lg font-light tracking-widest mb-2">暂无视频</h3>
              <p className="text-[#8A8FB8] text-sm max-w-md">
                当前S3存储桶的videos/目录中没有视频文件。
                请上传MP4、WebM、MOV等格式的视频文件到videos/目录。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
              {videos.map((video, i) => (
                <motion.div 
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-[#161616] border border-white/5">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Play size={24} fill="currentColor" className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium tracking-wide group-hover:text-white transition-colors">{video.title}</h3>
                      <p className="text-[11px] text-[#8A8FB8] mt-1 font-light">{video.description}</p>
                    </div>
                    <Maximize2 size={14} className="text-white/20 group-hover:text-white transition-colors mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center"
          >
            {/* Immersive Video Container */}
            <div 
              ref={videoContainerRef}
              className="w-full h-full relative bg-black flex items-center justify-center group/player"
            >
              <video 
                ref={videoRef}
                src={selectedVideo.videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain shadow-2xl"
              />

              {/* Top Controls Overlay */}
              <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between opacity-0 group-hover/player:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <div className="pointer-events-auto">
                  <h2 className="text-lg font-light tracking-widest text-white">{selectedVideo.title}</h2>
                  <p className="text-[10px] text-white/60 tracking-widest uppercase mt-1">沉浸播放模式</p>
                </div>
                <div className="flex items-center gap-4 pointer-events-auto">
                   <button 
                    onClick={toggleNativeFullscreen}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10"
                    title={isFullscreen ? "退出全屏" : "全屏模式"}
                  >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                  <button 
                    onClick={() => setSelectedVideo(null)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Watermark/Caption Overlay */}
              <div className="absolute bottom-16 left-12 max-w-sm pointer-events-none opacity-20 hidden md:block transition-opacity group-hover/player:opacity-40">
                 <p className="text-xs italic tracking-widest font-light text-white">
                   “以音为渡，静听人间。”
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoCollection;
