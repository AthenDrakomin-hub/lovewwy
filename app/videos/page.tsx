'use client'
import React, { useState } from 'react';
import VideoFeed from '../../components/VideoFeed';
import SharedNavbar from '../../components/SharedNavbar';
import VideoModal from '../../components/VideoModal';
import { TRANSLATIONS, Language } from '../../constants/translations';
import { MediaItem } from '../../types';

// 1. 适配 App Router 的标准 Props 类型
interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// 2. 将组件改为 export default function 格式
export default function VideosPage({ searchParams }: PageProps) {
  // 3. 从查询参数获取语言，默认为 'zh'
  const lang = (searchParams?.lang as Language) || 'zh';
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);
  const t = TRANSLATIONS[lang];

  const handlePlayVideo = (video: MediaItem) => {
    setActiveVideo(video);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <SharedNavbar lang={lang} />
      <div className="pt-24">
        <div className="relative">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[160px] -z-10"></div>
          {/* 注意：如果组件名是 VideoGrid 或 VideoFeed，请确保与你的 components 文件夹一致 */}
          <VideoFeed onPlayVideo={handlePlayVideo} translations={t.visuals} />
        </div>
      </div>
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}