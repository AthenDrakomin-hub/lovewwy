import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoFeed from '../components/VideoFeed';
import SharedNavbar from '../components/SharedNavbar';
import VideoModal from '../components/VideoModal';
import { TRANSLATIONS, Language } from '../constants/translations';
import { MediaItem } from '../types';

interface VideosPageProps {
  lang?: Language;
}

const VideosPage: React.FC<VideosPageProps> = ({ lang = 'zh' }) => {
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);
  const navigate = useNavigate();
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
          <VideoFeed onPlayVideo={handlePlayVideo} translations={t.visuals} />
        </div>
      </div>
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};

export default VideosPage;