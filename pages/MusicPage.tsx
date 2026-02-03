import React, { useState } from 'react';
import Hero from '../components/Hero';
import MusicHub from '../components/MusicHub';
import SharedNavbar from '../components/SharedNavbar';
import Player from '../components/Player';
import { TRANSLATIONS, Language } from '../constants/translations';
import { MUSIC } from '../constants';
import { MediaItem } from '../types';

interface MusicPageProps {
  lang?: Language;
}

const MusicPage: React.FC<MusicPageProps> = ({ lang = 'zh' }) => {
  const [currentTrack, setCurrentTrack] = useState<MediaItem>(MUSIC[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const t = TRANSLATIONS[lang];

  const handlePlayTrack = (track: MediaItem) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePlayPause = (playing: boolean) => {
    setIsPlaying(playing);
  };



  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <SharedNavbar lang={lang} />
      <div className="pt-24">
        <Hero translations={t.hero} />
        <div className="bg-gradient-to-b from-[#09090b] to-zinc-950/50">
          <MusicHub 
            onPlayTrack={handlePlayTrack} 
            currentTrackId={currentTrack.id} 
            isPlaying={isPlaying} 
            translations={t.beats} 
          />
        </div>
      </div>
      <Player 
        currentTrack={currentTrack} 
        isPlaying={isPlaying} 
        onPlayPause={handlePlayPause} 
        onPlayTrack={handlePlayTrack} 
      />
    </div>
  );
};

export default MusicPage;